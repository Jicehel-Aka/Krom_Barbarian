#!/usr/bin/env python3
"""
Generates firmware_aka_esp32s3/main/krom_assets.h from the verified cleaned PNG
sprite sheets and 320x240 stage backgrounds in public/sheets/.

Color format: Gamebuino AKA ST7789V native BGR565 matching lcd_color_rgb(r, g, b):
    (r >> 3) | ((g >> 2) << 5) | ((b >> 3) << 11)
Transparent color key: 0xF81F
"""

import os
import struct
import zlib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SHEETS_DIR = os.path.join(ROOT, "public", "sheets")
OUT_HEADER = os.path.join(ROOT, "firmware_aka_esp32s3", "main", "krom_assets.h")

TRANSPARENT_KEY = 0xF81F


def lcd_color_rgb(r: int, g: int, b: int) -> int:
    c = (r >> 3) | ((g >> 2) << 5) | ((b >> 3) << 11)
    if c == TRANSPARENT_KEY:
        c = 0xF83F  # Nudge green LSB so opaque pixels never match transparent key
    return c


def paeth(a: int, b: int, c: int) -> int:
    p = a + b - c
    pa = abs(p - a)
    pb = abs(p - b)
    pc = abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    if pb <= pc:
        return b
    return c


def read_png_rgba(path: str):
    with open(path, "rb") as f:
        data = f.read()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Not a PNG file: {path}")

    pos = 8
    width = height = bit_depth = color_type = interlace = 0
    plte = b""
    trns = b""
    idat_parts = []

    while pos < len(data):
        length, ctype = struct.unpack(">I4s", data[pos : pos + 8])
        chunk_data = data[pos + 8 : pos + 8 + length]
        pos += 12 + length
        if ctype == b"IHDR":
            width, height, bit_depth, color_type, _, _, interlace = struct.unpack(
                ">IIBBBBB", chunk_data
            )
        elif ctype == b"PLTE":
            plte = chunk_data
        elif ctype == b"tRNS":
            trns = chunk_data
        elif ctype == b"IDAT":
            idat_parts.append(chunk_data)
        elif ctype == b"IEND":
            break

    if bit_depth != 8 or interlace != 0:
        raise ValueError(
            f"Unsupported PNG format in {path}: depth={bit_depth}, interlace={interlace}"
        )

    bpp = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color_type]
    raw = zlib.decompress(b"".join(idat_parts))
    stride = width * bpp
    recon = bytearray(height * stride)

    src = 0
    for y in range(height):
        ftype = raw[src]
        src += 1
        row_out = y * stride
        prev_out = (y - 1) * stride
        for i in range(stride):
            x_byte = raw[src + i]
            a = recon[row_out + i - bpp] if i >= bpp else 0
            b = recon[prev_out + i] if y > 0 else 0
            c = recon[prev_out + i - bpp] if (y > 0 and i >= bpp) else 0
            if ftype == 0:
                val = x_byte
            elif ftype == 1:
                val = (x_byte + a) & 0xFF
            elif ftype == 2:
                val = (x_byte + b) & 0xFF
            elif ftype == 3:
                val = (x_byte + ((a + b) >> 1)) & 0xFF
            elif ftype == 4:
                val = (x_byte + paeth(a, b, c)) & 0xFF
            else:
                raise ValueError(f"Unknown PNG filter {ftype}")
            recon[row_out + i] = val
        src += stride

    rgba = bytearray(width * height * 4)
    if color_type == 6:
        rgba[:] = recon
    elif color_type == 2:
        for px in range(width * height):
            rgba[px * 4 : px * 4 + 3] = recon[px * 3 : px * 3 + 3]
            rgba[px * 4 + 3] = 255
    elif color_type == 3:
        for px in range(width * height):
            idx = recon[px]
            rgba[px * 4] = plte[idx * 3]
            rgba[px * 4 + 1] = plte[idx * 3 + 1]
            rgba[px * 4 + 2] = plte[idx * 3 + 2]
            rgba[px * 4 + 3] = trns[idx] if idx < len(trns) else 255
    elif color_type == 4:
        for px in range(width * height):
            g = recon[px * 2]
            rgba[px * 4 : px * 4 + 3] = bytes((g, g, g))
            rgba[px * 4 + 3] = recon[px * 2 + 1]
    elif color_type == 0:
        for px in range(width * height):
            g = recon[px]
            rgba[px * 4 : px * 4 + 3] = bytes((g, g, g))
            rgba[px * 4 + 3] = 255

    return width, height, rgba


def pack_stage_256(path: str):
    w, h, rgba = read_png_rgba(path)
    tw, th = 320, 240
    # Sample to 320x240 and quantize to a rich per-stage 256-color BGR565 palette
    # Bucket by 4-bit R, 4-bit G, 4-bit B -> pick top 256 buckets, map nearest
    pixels_rgb = []
    bucket_counts = {}
    bucket_sums = {}
    for y in range(th):
        sy = min(h - 1, (y * h) // th)
        for x in range(tw):
            sx = min(w - 1, (x * w) // tw)
            off = (sy * w + sx) * 4
            r, g, b = rgba[off], rgba[off + 1], rgba[off + 2]
            pixels_rgb.append((r, g, b))
            bk = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
            bucket_counts[bk] = bucket_counts.get(bk, 0) + 1
            if bk not in bucket_sums:
                bucket_sums[bk] = [0, 0, 0]
            bucket_sums[bk][0] += r
            bucket_sums[bk][1] += g
            bucket_sums[bk][2] += b

    top_buckets = sorted(bucket_counts.keys(), key=lambda k: -bucket_counts[k])[:256]
    pal_rgb = []
    pal_bgr565 = []
    bk_to_idx = {}
    for idx, bk in enumerate(top_buckets):
        cnt = bucket_counts[bk]
        ar = bucket_sums[bk][0] // cnt
        ag = bucket_sums[bk][1] // cnt
        ab = bucket_sums[bk][2] // cnt
        pal_rgb.append((ar, ag, ab))
        pal_bgr565.append(lcd_color_rgb(ar, ag, ab))
        bk_to_idx[bk] = idx

    while len(pal_bgr565) < 256:
        pal_bgr565.append(0)
        pal_rgb.append((0, 0, 0))

    # Map all buckets to nearest in pal_rgb
    for bk in bucket_counts.keys():
        if bk in bk_to_idx:
            continue
        cnt = bucket_counts[bk]
        ar = bucket_sums[bk][0] // cnt
        ag = bucket_sums[bk][1] // cnt
        ab = bucket_sums[bk][2] // cnt
        best_i = 0
        best_d = 1 << 30
        for i, (pr, pg, pb) in enumerate(pal_rgb):
            d = (ar - pr) ** 2 + (ag - pg) ** 2 + (ab - pb) ** 2
            if d < best_d:
                best_d = d
                best_i = i
        bk_to_idx[bk] = best_i

    indices = bytearray(tw * th)
    for i, (r, g, b) in enumerate(pixels_rgb):
        bk = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
        indices[i] = bk_to_idx[bk]

    return pal_bgr565, bytes(indices)


def extract_scaled_sprite_rle(sheet_img, box, scale: float):
    sw, sh, rgba = sheet_img
    bx, by, bw, bh, bax = box
    dw = max(1, int(round(bw * scale)))
    dh = max(1, int(round(bh * scale)))
    dax = int(round(bax * scale))

    words = []
    for dy in range(dh):
        sy = min(sh - 1, by + int((dy + 0.5) * bh / dh))
        for dx in range(dw):
            sx = min(sw - 1, bx + int((dx + 0.5) * bw / dw))
            off = (sy * sw + sx) * 4
            r, g, b, a = rgba[off], rgba[off + 1], rgba[off + 2], rgba[off + 3]
            if a < 115:
                words.append(TRANSPARENT_KEY)
            else:
                words.append(lcd_color_rgb(r, g, b))

    # RLE encode: pairs of (count: uint16_t, color: uint16_t) -> very fast & compact!
    # Even tighter: byte stream where:
    #   0x00..0x7F (n): (n + 1) transparent pixels
    #   0x80..0xBF (n): (n - 0x80 + 1) identical opaque pixels followed by 1 uint16_t LE
    #   0xC0..0xFF (n): (n - 0xC0 + 1) literal opaque pixels followed by count * uint16_t LE
    out = bytearray()
    i = 0
    total = len(words)
    while i < total:
        if words[i] == TRANSPARENT_KEY:
            run = 1
            while i + run < total and words[i + run] == TRANSPARENT_KEY and run < 128:
                run += 1
            out.append(run - 1)
            i += run
        else:
            # Check repeat run
            run = 1
            while (
                i + run < total
                and words[i + run] == words[i]
                and words[i] != TRANSPARENT_KEY
                and run < 64
            ):
                run += 1
            if run >= 2:
                out.append(0x80 | (run - 1))
                out.extend(struct.pack("<H", words[i]))
                i += run
            else:
                lit = []
                while i < total and words[i] != TRANSPARENT_KEY and len(lit) < 64:
                    if (
                        i + 1 < total
                        and words[i + 1] == words[i]
                        and len(lit) >= 1
                    ):
                        break
                    lit.append(words[i])
                    i += 1
                out.append(0xC0 | (len(lit) - 1))
                for c in lit:
                    out.extend(struct.pack("<H", c))

    return dw, dh, dax, bytes(out)


def rle_encode_indices(indices: bytes) -> bytes:
    """Lossless RLE for 8-bit palette indices:
    - 0x00..0x7F (n): repeat next 1 byte (n + 1) times
    - 0x80..0xFF (n): (n - 0x80 + 1) literal bytes follow
    """
    out = bytearray()
    i = 0
    total = len(indices)
    while i < total:
        run = 1
        while i + run < total and indices[i + run] == indices[i] and run < 128:
            run += 1
        if run >= 2:
            out.append(run - 1)
            out.append(indices[i])
            i += run
        else:
            lit = bytearray()
            while i < total and len(lit) < 128:
                if i + 1 < total and indices[i + 1] == indices[i] and len(lit) >= 1:
                    break
                lit.append(indices[i])
                i += 1
            out.append(0x80 | (len(lit) - 1))
            out.extend(lit)
    return bytes(out)


def fmt_u8_array(data: bytes, cols: int = 48) -> str:
    lines = []
    for i in range(0, len(data), cols):
        chunk = ",".join(str(b) for b in data[i : i + cols])
        lines.append(f"{chunk},")
    return "\n".join(lines)


def fmt_u16_array(vals, cols: int = 24) -> str:
    lines = []
    for i in range(0, len(vals), cols):
        chunk = ",".join(str(v) for v in vals[i : i + cols])
        lines.append(f"{chunk},")
    return "\n".join(lines)


def main():
    print("Loading cleaned master sheets from public/sheets/...")
    stages_src = [
        ("STAGE_FOREST", "decor_acte1_foret_320x240.png"),
        ("STAGE_CRYPT", "decor_acte2_crypte_320x240.png"),
        ("STAGE_ARENA", "decor_acte3_arene_320x240.png"),
        ("STAGE_SANCTUARY", "decor_acte4_sanctuaire_320x240.png"),
    ]

    sheets = {
        "krom": read_png_rgba(os.path.join(SHEETS_DIR, "planche_j1_krom.png")),
        "rival": read_png_rgba(os.path.join(SHEETS_DIR, "planche_j2_rival_aka.png")),
        "gorgar": read_png_rgba(os.path.join(SHEETS_DIR, "planche_boss1_gorgar.png")),
        "vorgath": read_png_rgba(os.path.join(SHEETS_DIR, "planche_boss2_vorgath.png")),
        "malakor": read_png_rgba(os.path.join(SHEETS_DIR, "planche_boss3_malakor.png")),
        "drax": read_png_rgba(os.path.join(SHEETS_DIR, "planche_boss4_seigneur_drax.png")),
        "minions": read_png_rgba(os.path.join(SHEETS_DIR, "planche_sbires_zones.png")),
        "goblin": read_png_rgba(os.path.join(SHEETS_DIR, "planche_gobelin_et_animations.png")),
    }

    # 19-slot animation table per Fighter Skin:
    # 0:IDLE0, 1:IDLE1, 2:WALK0, 3:WALK1, 4:WALK2, 5:WALK3,
    # 6:ATK0, 7:ATK1, 8:CLEAVE, 9:SWEEP,
    # 10:BLOCK, 11:CROUCH, 12:JUMP, 13:HIT,
    # 14:DEAD0, 15:DEAD1, 16:DECAP0, 17:DECAP1, 18:VICTORY
    skin_defs = [
        (
            "SKIN_KROM",
            "krom",
            0.35,
            [
                (8, 8, 116, 204, 56),
                (266, 25, 111, 187, 51),
                (659, 24, 96, 188, 45),
                (769, 24, 96, 188, 44),
                (879, 26, 107, 186, 47),
                (1000, 24, 126, 188, 48),
                (8, 240, 148, 198, 87),
                (780, 493, 223, 173, 80),
                (184, 489, 224, 177, 85),
                (335, 263, 217, 175, 78),
                (894, 229, 112, 209, 48),
                (8, 732, 173, 156, 73),
                (193, 684, 124, 204, 73),
                (983, 710, 164, 178, 89),
                (190, 938, 168, 122, 67),
                (1004, 1000, 219, 60, 99),
                (185, 1170, 197, 138, 102),
                (646, 1248, 248, 60, 124),
                (1229, 1100, 138, 208, 71),
            ],
        ),
        (
            "SKIN_RIVAL",
            "rival",
            0.46,
            [
                (12, 17, 140, 134, 50),
                (325, 26, 142, 125, 52),
                (640, 13, 142, 138, 52),
                (798, 12, 139, 139, 48),
                (953, 12, 141, 139, 51),
                (1110, 13, 140, 138, 48),
                (12, 220, 145, 137, 92),
                (173, 220, 215, 137, 87),
                (599, 211, 168, 146, 67),
                (404, 220, 179, 137, 64),
                (1151, 176, 103, 181, 48),
                (145, 440, 119, 120, 56),
                (858, 386, 131, 174, 84),
                (12, 584, 150, 140, 66),
                (508, 648, 183, 76, 89),
                (1106, 651, 184, 73, 94),
                (149, 854, 147, 135, 74),
                (531, 916, 196, 73, 102),
                (1000, 748, 116, 241, 58),
            ],
        ),
        (
            "SKIN_GORGAR",
            "gorgar",
            0.41,
            [
                (12, 13, 146, 163, 55),
                (340, 23, 147, 153, 54),
                (669, 13, 123, 163, 49),
                (810, 12, 124, 164, 47),
                (952, 13, 126, 163, 48),
                (1096, 13, 132, 163, 50),
                (162, 205, 133, 170, 72),
                (491, 200, 174, 175, 74),
                (380, 399, 175, 153, 81),
                (683, 219, 161, 156, 61),
                (862, 221, 147, 154, 58),
                (1097, 416, 146, 136, 57),
                (12, 576, 158, 180, 96),
                (354, 599, 141, 157, 60),
                (687, 629, 179, 127, 76),
                (12, 933, 203, 88, 96),
                (392, 866, 213, 155, 110),
                (912, 933, 263, 88, 156),
                (1193, 780, 141, 241, 67),
            ],
        ),
        (
            "SKIN_VORGATH",
            "vorgath",
            0.36,
            [
                (12, 12, 135, 208, 54),
                (318, 23, 135, 197, 52),
                (624, 37, 130, 183, 56),
                (772, 38, 132, 182, 57),
                (922, 38, 129, 182, 55),
                (1069, 37, 130, 183, 54),
                (12, 249, 147, 206, 84),
                (341, 245, 162, 210, 76),
                (667, 288, 303, 167, 139),
                (521, 292, 128, 163, 66),
                (988, 244, 122, 211, 69),
                (208, 524, 176, 148, 81),
                (603, 485, 185, 187, 103),
                (806, 479, 156, 193, 65),
                (242, 696, 185, 171, 85),
                (681, 770, 218, 97, 96),
                (190, 965, 244, 186, 130),
                (735, 1059, 269, 92, 147),
                (1241, 891, 145, 260, 62),
            ],
        ),
        (
            "SKIN_MALAKOR",
            "malakor",
            0.37,
            [
                (12, 17, 167, 190, 46),
                (373, 17, 141, 190, 60),
                (688, 20, 127, 187, 79),
                (833, 20, 128, 187, 82),
                (979, 20, 125, 187, 87),
                (1122, 19, 120, 188, 75),
                (12, 231, 170, 209, 88),
                (200, 263, 192, 177, 132),
                (819, 266, 232, 174, 86),
                (602, 266, 199, 174, 103),
                (1069, 251, 152, 189, 68),
                (169, 505, 139, 146, 67),
                (1043, 464, 170, 187, 88),
                (12, 679, 151, 184, 66),
                (560, 690, 200, 173, 85),
                (12, 1042, 200, 107, 84),
                (399, 969, 221, 180, 116),
                (908, 1061, 258, 88, 142),
                (1385, 887, 154, 262, 76),
            ],
        ),
        (
            "SKIN_DRAX",
            "drax",
            0.39,
            [
                (12, 29, 170, 177, 67),
                (384, 12, 122, 194, 63),
                (708, 28, 120, 178, 59),
                (846, 28, 117, 178, 58),
                (981, 28, 114, 178, 56),
                (1113, 28, 116, 178, 55),
                (12, 244, 209, 173, 91),
                (418, 230, 158, 187, 65),
                (964, 241, 187, 176, 77),
                (594, 243, 167, 174, 67),
                (1169, 237, 159, 180, 69),
                (174, 480, 146, 154, 55),
                (539, 446, 192, 188, 110),
                (946, 452, 185, 182, 108),
                (199, 680, 198, 145, 94),
                (650, 743, 211, 82, 107),
                (173, 941, 201, 193, 114),
                (671, 1052, 255, 82, 151),
                (1142, 849, 167, 285, 89),
            ],
        ),
        (
            "SKIN_RAIDER",
            "minions",
            0.45,
            [
                (12, 20, 108, 112, 41),
                (136, 28, 109, 104, 40),
                (261, 20, 91, 112, 36),
                (368, 20, 92, 112, 35),
                (476, 20, 93, 112, 36),
                (585, 20, 98, 112, 37),
                (699, 15, 98, 117, 56),
                (927, 12, 118, 120, 55),
                (1061, 25, 119, 107, 45),
                (927, 12, 118, 120, 55),
                (12, 176, 109, 105, 43),
                (137, 189, 108, 92, 42),
                (927, 12, 118, 120, 55),
                (261, 174, 104, 107, 44),
                (512, 196, 132, 85, 56),
                (836, 216, 150, 65, 71),
                (1122, 166, 158, 115, 81),
                (1513, 216, 195, 65, 115),
                (12, 20, 108, 112, 41),
            ],
        ),
        (
            "SKIN_SKELETON",
            "minions",
            0.45,
            [
                (12, 956, 118, 113, 42),
                (146, 964, 119, 105, 44),
                (281, 953, 119, 116, 44),
                (416, 952, 117, 117, 40),
                (549, 952, 118, 117, 43),
                (683, 953, 118, 116, 40),
                (817, 954, 122, 115, 77),
                (955, 954, 181, 115, 73),
                (1152, 954, 150, 115, 54),
                (955, 954, 181, 115, 73),
                (12, 1089, 87, 152, 40),
                (115, 1140, 100, 101, 47),
                (817, 954, 122, 115, 77),
                (231, 1123, 126, 118, 55),
                (515, 1177, 154, 64, 75),
                (856, 1180, 155, 61, 79),
                (1145, 1128, 123, 113, 62),
                (1471, 1180, 165, 61, 86),
                (12, 956, 118, 113, 42),
            ],
        ),
        (
            "SKIN_PIT_BEAST",
            "minions",
            0.45,
            [
                (12, 1275, 122, 139, 34),
                (150, 1275, 103, 139, 44),
                (269, 1277, 93, 137, 58),
                (378, 1277, 92, 137, 59),
                (486, 1277, 91, 137, 64),
                (593, 1277, 87, 137, 55),
                (696, 1261, 124, 153, 64),
                (836, 1285, 140, 129, 96),
                (1135, 1287, 169, 127, 63),
                (992, 1269, 127, 145, 88),
                (12, 1445, 111, 138, 50),
                (139, 1476, 101, 107, 49),
                (696, 1261, 124, 153, 64),
                (256, 1449, 110, 134, 48),
                (531, 1457, 146, 126, 62),
                (853, 1505, 146, 78, 61),
                (1141, 1452, 161, 131, 85),
                (1518, 1519, 188, 64, 104),
                (12, 1275, 122, 139, 34),
            ],
        ),
        (
            "SKIN_DARK_GUARD",
            "minions",
            0.45,
            [
                (12, 1616, 128, 133, 50),
                (156, 1603, 92, 146, 47),
                (264, 1615, 90, 134, 44),
                (370, 1615, 88, 134, 44),
                (474, 1615, 86, 134, 42),
                (576, 1615, 87, 134, 41),
                (679, 1619, 157, 130, 68),
                (852, 1617, 121, 132, 58),
                (989, 1609, 118, 140, 49),
                (1123, 1619, 125, 130, 50),
                (12, 1786, 119, 135, 52),
                (147, 1805, 109, 116, 40),
                (989, 1609, 118, 140, 49),
                (272, 1785, 139, 136, 81),
                (549, 1797, 127, 124, 62),
                (871, 1859, 158, 62, 80),
                (1167, 1776, 151, 145, 86),
                (1546, 1859, 190, 62, 112),
                (12, 1616, 128, 133, 50),
            ],
        ),
    ]

    goblin_boxes = [
        ("GOB_WALK_0", (16, 33, 107, 151, 53)),
        ("GOB_WALK_1", (261, 35, 108, 149, 54)),
        ("GOB_LAUGH", (512, 26, 138, 158, 69)),
        ("GOB_DRAG", (1118, 34, 202, 150, 101)),
    ]

    total_bytes = 0
    cpp = []
    cpp.append("// Auto-generated by tools/pack_assets.py — DO NOT EDIT MANUALLY")
    cpp.append("#pragma once")
    cpp.append("#include <cstdint>")
    cpp.append("#include <cstddef>")
    cpp.append("")
    cpp.append(f"static constexpr uint16_t KROM_TRANSPARENT = 0x{TRANSPARENT_KEY:04X};")
    cpp.append("")
    cpp.append("struct PackedStageAsset {")
    cpp.append("    const uint16_t* palette256;")
    cpp.append("    uint32_t        rleLen;")
    cpp.append("    const uint8_t*  rleIndices;")
    cpp.append("};")
    cpp.append("")
    cpp.append("struct PackedSpriteRle {")
    cpp.append("    uint16_t w;")
    cpp.append("    uint16_t h;")
    cpp.append("    int16_t  ax;")
    cpp.append("    uint32_t rleLen;")
    cpp.append("    const uint8_t* rleData;")
    cpp.append("};")
    cpp.append("")

    # Emit 4 stages (RLE-compressed 256-color indices)
    stage_entries = []
    for s_name, fname in stages_src:
        pal, idx = pack_stage_256(os.path.join(SHEETS_DIR, fname))
        rle_idx = rle_encode_indices(idx)
        total_bytes += len(pal) * 2 + len(rle_idx)
        cpp.append(f"static const uint16_t {s_name}_PAL[256] = {{")
        cpp.append(fmt_u16_array(pal))
        cpp.append("};")
        cpp.append(f"static const uint8_t {s_name}_IDX[{len(rle_idx)}] = {{")
        cpp.append(fmt_u8_array(rle_idx))
        cpp.append("};")
        stage_entries.append(f"    {{ {s_name}_PAL, {len(rle_idx)}, {s_name}_IDX }},")

    cpp.append("static const PackedStageAsset PACKED_STAGES[4] = {")
    cpp.extend(stage_entries)
    cpp.append("};")
    cpp.append("")

    # Emit deduplicated sprite RLE blobs
    blob_map = {}
    blob_list = []

    def reg_sprite(sheet_key: str, box, scale: float):
        nonlocal total_bytes
        key = (sheet_key, box, round(scale, 3))
        if key in blob_map:
            return blob_map[key]
        dw, dh, dax, rle = extract_scaled_sprite_rle(sheets[sheet_key], box, scale)
        b_idx = len(blob_list)
        blob_list.append((dw, dh, dax, rle))
        blob_map[key] = b_idx
        total_bytes += len(rle)
        return b_idx

    skin_table_rows = []
    for skin_enum, sh_key, sc, boxes in skin_defs:
        ids = [reg_sprite(sh_key, b, sc) for b in boxes]
        skin_table_rows.append((skin_enum, ids))

    gob_ids = [reg_sprite("goblin", b, 0.32) for _, b in goblin_boxes]

    for idx, (dw, dh, dax, rle) in enumerate(blob_list):
        cpp.append(f"static const uint8_t SPR_RLE_{idx}[{len(rle)}] = {{")
        cpp.append(fmt_u8_array(rle))
        cpp.append("};")

    cpp.append("")
    cpp.append(f"static constexpr int TOTAL_PACKED_SPRITES = {len(blob_list)};")
    cpp.append("static const PackedSpriteRle PACKED_SPRITES[TOTAL_PACKED_SPRITES] = {")
    for idx, (dw, dh, dax, rle) in enumerate(blob_list):
        cpp.append(f"    {{ {dw}, {dh}, {dax}, {len(rle)}, SPR_RLE_{idx} }},")
    cpp.append("};")
    cpp.append("")

    cpp.append("enum SkinId {")
    for skin_enum, _ in skin_table_rows:
        cpp.append(f"    {skin_enum},")
    cpp.append("    SKIN_COUNT")
    cpp.append("};")
    cpp.append("")
    cpp.append("static const uint16_t SKIN_ANIM_FRAMES[SKIN_COUNT][19] = {")
    for skin_enum, ids in skin_table_rows:
        id_str = ", ".join(str(x) for x in ids)
        cpp.append(f"    /* {skin_enum} */ {{ {id_str} }},")
    cpp.append("};")
    cpp.append("")
    cpp.append(
        "static const uint16_t GOBLIN_ANIM_FRAMES[4] = { "
        + ", ".join(str(x) for x in gob_ids)
        + " };"
    )
    cpp.append("")

    with open(OUT_HEADER, "w", encoding="utf-8") as f:
        f.write("\n".join(cpp) + "\n")

    print(
        f"Generated {OUT_HEADER}: {len(blob_list)} unique sprites + 4 full 320x240 stages, "
        f"total binary payload = {total_bytes / 1024:.1f} KB"
    )


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Builds the 4 extended 2560x240 (8 screens of 320x240) 16-bit pixel-art narrative
traversal panoramas:
  - public/sheets/panorama_acte1_2560x240.png
  - public/sheets/panorama_acte2_2560x240.png
  - public/sheets/panorama_acte3_2560x240.png
  - public/sheets/panorama_acte4_2560x240.png

Narrative & Visual Architecture per Act:
- Act 1 (Forest -> Entrance, y_floor=194, y_curb=224):
    Long atmospheric journey deep through misty Nordic pine & oak woods (~2040px
    of varied woodland clearings, fallen logs, hunter cairns, mossy boulders, and
    timber log gates) before finally arriving at the glowing cyan runic entrance (~520px).
- Act 2 (Stairs -> Dark Grotto -> Sparse Lava -> Full Lava Waterfalls, y_floor=190, y_curb=229):
    Starts descending the mossy stone stairs into the underground archway (~360px),
    traverses a long pitch-dark stalactite & obsidian grotto with ZERO lava (~1040px),
    enters a deep volcanic rock vault with ONLY thin magma cracks & a tiny lava trickle (~600px),
    and ends directly on the roaring twin lava waterfalls & lava river of level 2 (~560px).
- Act 3 (Dark Cells -> Torchlit Armory -> Sunlight -> Long Coliseum Walls -> Arena Entrance, y_floor=188, y_curb=231):
    Emerges from dark barred cells through the torchlit armory into bright sunlight (~930px),
    skirts ~1340px of uninterrupted sunlit sandstone outer coliseum rampart walls (buttresses,
    barred windows, skulls, banners, weapon racks) warming smoothly into sunset before arriving
    at the horned-skull entrance of the current arena (~290px).
- Act 4 (Left Ochre Castle -> Ochre Castle Passage -> Neutral Storm Ridge -> Black Bridge & Right Castle, y_floor=196, y_curb=228):
    Starts at the weathered ochre fortress on the left (~255px), traverses a long courtyard &
    arched rampart passage in the exact same ochre castle architecture (~760px), crosses a
    castle-free neutral windswept grey-slate storm ridge & misty abyss pass (~865px), and
    finally crosses the black crimson-rune viaduct bridge to the dark gothic castle on the right (~680px).
"""

import math
import os
import subprocess

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SHEETS_DIR = os.path.join(ROOT, "public", "sheets")
IMAGES_DIR = os.path.join(ROOT, "src", "assets", "images")

PANO_W = 2560
PANO_H = 240

BAYER4 = (
    (0, 8, 2, 10),
    (12, 4, 14, 6),
    (3, 11, 1, 9),
    (15, 7, 13, 5),
)


def load_rgb(path: str, resize_wh=None):
    cmd = ["convert", path]
    if resize_wh is not None:
        rw, rh = resize_wh
        cmd += ["-filter", "Point", "-resize", f"{rw}x{rh}!"]
        w, h = rw, rh
    else:
        ident = (
            subprocess.check_output(["identify", "-format", "%w %h", path])
            .decode("ascii")
            .split()
        )
        w, h = int(ident[0]), int(ident[1])
    cmd += ["-depth", "8", "rgb:-"]
    raw = bytearray(subprocess.check_output(cmd))
    return w, h, raw


def save_rgb_png(path: str, w: int, h: int, buf: bytearray):
    out = bytearray(len(buf))
    for i in range(0, len(buf), 3):
        r = buf[i]
        g = buf[i + 1]
        b = buf[i + 2]
        r5 = r >> 3
        g6 = g >> 2
        b5 = b >> 3
        out[i] = (r5 << 3) | (r5 >> 2)
        out[i + 1] = (g6 << 2) | (g6 >> 4)
        out[i + 2] = (b5 << 3) | (b5 >> 2)

    proc = subprocess.Popen(
        [
            "convert",
            "-size",
            f"{w}x{h}",
            "-depth",
            "8",
            "rgb:-",
            "-define",
            "png:compression-level=9",
            path,
        ],
        stdin=subprocess.PIPE,
    )
    proc.communicate(bytes(out))
    if proc.returncode != 0:
        raise RuntimeError(f"Failed saving {path}")


def crop_rgb(img, x0: int, y0: int, cw: int, ch: int):
    w, h, raw = img
    out = bytearray(cw * ch * 3)
    for y in range(ch):
        sy = max(0, min(h - 1, y0 + y))
        for x in range(cw):
            sx = max(0, min(w - 1, x0 + x))
            s_off = (sy * w + sx) * 3
            d_off = (y * cw + x) * 3
            out[d_off : d_off + 3] = raw[s_off : s_off + 3]
    return cw, ch, out


def warp_vertical_piecewise(img, src_knots, dst_knots, out_h: int = 240):
    w, h, raw = img
    out = bytearray(w * out_h * 3)
    for dy in range(out_h):
        sy_f = float(dy)
        for k in range(len(dst_knots) - 1):
            d0, d1 = dst_knots[k], dst_knots[k + 1]
            s0, s1 = src_knots[k], src_knots[k + 1]
            if dy <= d1 or k == len(dst_knots) - 2:
                t = 0.0 if d1 == d0 else (dy - d0) / float(d1 - d0)
                sy_f = s0 + t * (s1 - s0)
                break
        sy = max(0, min(h - 1, int(round(sy_f))))
        out[dy * w * 3 : (dy + 1) * w * 3] = raw[sy * w * 3 : (sy + 1) * w * 3]
    return w, out_h, out


def warp_vertical_2d(img, src_knots_left, src_knots_right, dst_knots, out_h: int = 240):
    """Column-wise piecewise vertical warp for assets whose walkable wall-base has a slight
    left-to-right perspective slope, leveling both y_floor and y_curb to 0.0px across all x!"""
    w, h, raw = img
    out = bytearray(w * out_h * 3)
    for x in range(w):
        tx = x / float(max(1, w - 1))
        s_knots = [
            src_knots_left[i] + tx * (src_knots_right[i] - src_knots_left[i])
            for i in range(len(dst_knots))
        ]
        for dy in range(out_h):
            sy_f = float(dy)
            for k in range(len(dst_knots) - 1):
                d0, d1 = dst_knots[k], dst_knots[k + 1]
                s0, s1 = s_knots[k], s_knots[k + 1]
                if dy <= d1 or k == len(dst_knots) - 2:
                    t = 0.0 if d1 == d0 else (dy - d0) / float(d1 - d0)
                    sy_f = s0 + t * (s1 - s0)
                    break
            sy = max(0, min(h - 1, int(round(sy_f))))
            out[(dy * w + x) * 3 : (dy * w + x + 1) * 3] = raw[
                (sy * w + x) * 3 : (sy * w + x + 1) * 3
            ]
    return w, out_h, out


def band_stats(img, x0: int, x1: int, y0: int, y1: int):
    w, h, raw = img
    x0 = max(0, min(w - 1, x0))
    x1 = max(x0 + 1, min(w, x1))
    y0 = max(0, min(h - 1, y0))
    y1 = max(y0 + 1, min(h, y1))
    n = (x1 - x0) * (y1 - y0)
    sr = sg = sb = 0.0
    for y in range(y0, y1):
        row = y * w * 3
        for x in range(x0, x1):
            off = row + x * 3
            sr += raw[off]
            sg += raw[off + 1]
            sb += raw[off + 2]
    mr, mg, mb = sr / n, sg / n, sb / n
    vr = vg = vb = 0.0
    for y in range(y0, y1):
        row = y * w * 3
        for x in range(x0, x1):
            off = row + x * 3
            vr += (raw[off] - mr) ** 2
            vg += (raw[off + 1] - mg) ** 2
            vb += (raw[off + 2] - mb) ** 2
    return (
        (mr, mg, mb),
        (math.sqrt(vr / n) + 1.0, math.sqrt(vg / n) + 1.0, math.sqrt(vb / n) + 1.0),
    )


def grade_band_toward(
    img,
    ref_mean,
    ref_std,
    y0: int,
    y1: int,
    strength_mean: float = 0.85,
    strength_std: float = 0.55,
    protect_bright_fx: bool = True,
    feather_top: int = 8,
    feather_bot: int = 0,
    horiz_ramp=None,
    sample_x_range=None,
):
    """Grades [y0, y1) toward (ref_mean, ref_std). Optional horiz_ramp=(h0, h1) modulates
    grading strength horizontally from left (x=0 -> h0) to right (x=w-1 -> h1)."""
    w, h, raw = img
    out = bytearray(raw)
    sx0, sx1 = sample_x_range if sample_x_range is not None else (0, w)
    cur_mean, cur_std = band_stats(img, sx0, sx1, y0, y1)
    for y in range(max(0, y0), min(h, y1)):
        feather = 1.0
        if y0 > 0 and feather_top > 0 and (y - y0) < feather_top:
            feather = min(feather, (y - y0 + 1) / float(feather_top))
        if y1 < h and feather_bot > 0 and (y1 - 1 - y) < feather_bot:
            feather = min(feather, (y1 - y) / float(feather_bot))

        row = y * w * 3
        for x in range(w):
            hx = 1.0
            if horiz_ramp is not None:
                tx = x / float(max(1, w - 1))
                hx = horiz_ramp[0] + tx * (horiz_ramp[1] - horiz_ramp[0])
            off = row + x * 3
            r, g, b = raw[off], raw[off + 1], raw[off + 2]
            keep = 0.0
            if protect_bright_fx:
                mx = max(r, g, b)
                sat = mx - min(r, g, b)
                if mx > 195 or (mx > 150 and sat > 85):
                    keep = min(0.85, (mx - 140) / 100.0)
            eff_m = strength_mean * feather * hx * (1.0 - keep)
            eff_s = strength_std * feather * hx * (1.0 - keep)

            vals = (r, g, b)
            aged = []
            for c in range(3):
                scale = 1.0 + eff_s * (
                    min(1.6, max(0.55, ref_std[c] / cur_std[c])) - 1.0
                )
                v = (vals[c] - cur_mean[c]) * scale + (
                    cur_mean[c] + eff_m * (ref_mean[c] - cur_mean[c])
                )
                aged.append(max(0, min(255, int(round(v)))))
            out[off], out[off + 1], out[off + 2] = aged[0], aged[1], aged[2]
    return w, h, out


def extinguish_background_lava(img, y_max: int = 190):
    """Converts warm orange/red background magma glow into cold dark subterranean
    cavern slate/obsidian so pure grotto vaults contain ZERO lava!"""
    w, h, raw = img
    out = bytearray(raw)
    for y in range(min(h, y_max)):
        row = y * w * 3
        for x in range(w):
            off = row + x * 3
            r, g, b = out[off], out[off + 1], out[off + 2]
            if r > b + 16 or g > b + 14:
                lum = 0.25 * r + 0.50 * g + 0.25 * b
                dark = min(54.0, lum * 0.42 + 8.0)
                out[off] = max(6, min(255, int(round(dark * 0.86))))
                out[off + 1] = max(7, min(255, int(round(dark * 0.92))))
                out[off + 2] = max(10, min(255, int(round(dark * 1.12))))
    return w, h, out


def erase_distant_crenelations(img, x0: int, x1: int, y0: int, y1: int):
    """Smoothly replaces only dark distant turret crenelation pixels (lum < 46) in [x0..x1, y0..y1]
    with the local storm-cloud tone from the top of that column—zero rectangular stamps!"""
    w, h, raw = img
    out = bytearray(raw)
    for x in range(max(0, x0), min(w, x1)):
        # Find nearest cloud pixel above y0..y0+14 with lum >= 48
        ref_y = max(2, y0 - 4)
        for ty in range(max(2, y0 - 8), min(h - 1, y1)):
            off_t = (ty * w + x) * 3
            lum_t = (raw[off_t] + raw[off_t + 1] + raw[off_t + 2]) // 3
            if lum_t >= 48:
                ref_y = ty
                break
        off_ref = (ref_y * w + x) * 3
        cr, cg, cb = raw[off_ref], raw[off_ref + 1], raw[off_ref + 2]
        for y in range(max(0, y0), min(h, y1)):
            off = (y * w + x) * 3
            r, g, b = out[off], out[off + 1], out[off + 2]
            lum = (r + g + b) // 3
            if lum < 46:
                jit = ((BAYER4[y & 3][x & 3] - 7) * 3) // 4
                out[off] = max(14, min(255, cr + jit))
                out[off + 1] = max(14, min(255, cg + jit))
                out[off + 2] = max(20, min(255, cb + jit))
    return w, h, out


def stitch_segments_panorama(
    segments, y_floor: int, target_w: int = PANO_W, slope_dir: float = 1.35
):
    """
    segments: list of tuples (img, overlap_px, upper_mode)
      upper_mode:
        - "dither": wide Bayer-dithered sky/rock/wall transition with organic contour
        - "right_occludes": right segment begins at sx=0 with a full-height foreground
          tree trunk or stone column standing crisply in front of the left backdrop
        - "left_occludes": left segment ends at cur_end with a full-height foreground
          tree trunk or stone column standing crisply in front of the right backdrop
    Below y_floor:
        Uses wide diagonal perspective slant + irregular staggered ashlar/earth courses
        + smooth ambient floor weathering across the overlap so ZERO straight vertical
        lines or floor height steps ever appear on the ground!
    """
    total_w = segments[0][0][0]
    for seg_img, ov, _ in segments[1:]:
        total_w += seg_img[0] - ov
    if total_w != target_w:
        raise ValueError(f"Expected total width {target_w}, got {total_w}")

    canvas = bytearray(target_w * PANO_H * 3)
    w0, _, raw0 = segments[0][0]
    for y in range(PANO_H):
        canvas[y * target_w * 3 : y * target_w * 3 + w0 * 3] = raw0[
            y * w0 * 3 : (y + 1) * w0 * 3
        ]

    cur_end = w0
    for seg_idx, (seg_img, ov, upper_mode) in enumerate(segments[1:], 1):
        sw, _, sraw = seg_img
        start_x = cur_end - ov
        slant = slope_dir if (seg_idx % 2 == 1) else -slope_dir

        for y in range(PANO_H):
            c_row = y * target_w * 3
            s_row = y * sw * 3

            if y < y_floor:
                if upper_mode == "right_occludes":
                    bark_jit = ((y * 5 + seg_idx * 7) % 3) - 1
                    cut_x = start_x + 2 + max(0, bark_jit)
                    for sx in range(sw):
                        dx = start_x + sx
                        if dx >= cut_x:
                            canvas[c_row + dx * 3 : c_row + dx * 3 + 3] = sraw[
                                s_row + sx * 3 : s_row + sx * 3 + 3
                            ]
                        elif dx >= start_x:
                            shade = 0.74 + 0.20 * (
                                (cut_x - dx) / float(max(1, cut_x - start_x + 3))
                            )
                            for c in range(3):
                                canvas[c_row + dx * 3 + c] = int(
                                    canvas[c_row + dx * 3 + c] * min(1.0, shade)
                                )
                elif upper_mode == "left_occludes":
                    bark_jit = ((y * 5 + seg_idx * 11) % 3) - 1
                    cut_x = cur_end - 3 + min(0, bark_jit)
                    for sx in range(sw):
                        dx = start_x + sx
                        if dx >= cut_x + 3:
                            canvas[c_row + dx * 3 : c_row + dx * 3 + 3] = sraw[
                                s_row + sx * 3 : s_row + sx * 3 + 3
                            ]
                        elif dx >= cut_x:
                            for c in range(3):
                                canvas[c_row + dx * 3 + c] = int(
                                    sraw[s_row + sx * 3 + c] * 0.76
                                )
                else:
                    u_margin = max(4, ov // 7)
                    u_x0 = start_x + u_margin
                    u_x1 = cur_end - u_margin
                    u_span = max(8, u_x1 - u_x0)
                    wave = math.sin(y * 0.09 + seg_idx * 1.7) * 0.12
                    for sx in range(sw):
                        dx = start_x + sx
                        if dx >= cur_end:
                            canvas[c_row + dx * 3 : c_row + dx * 3 + 3] = sraw[
                                s_row + sx * 3 : s_row + sx * 3 + 3
                            ]
                        elif dx >= u_x0:
                            t = (dx - u_x0) / float(u_span)
                            jitter = ((y * 7 + seg_idx * 13) % 5 - 2) * 0.035 + wave
                            tp = max(0.0, min(1.0, t + jitter))
                            thresh = (BAYER4[y & 3][dx & 3] + 0.5) / 16.0
                            if tp >= thresh:
                                canvas[c_row + dx * 3 : c_row + dx * 3 + 3] = sraw[
                                    s_row + sx * 3 : s_row + sx * 3 + 3
                                ]
            else:
                rel_y = y - y_floor
                course = rel_y // 5
                stagger = ((course & 1) * 18 - 9) + int(
                    round(8.0 * math.sin(course * 2.1 + seg_idx * 1.9))
                )
                diag_shift = rel_y * slant + stagger
                seam_center = (start_x + cur_end) * 0.5 + max(
                    -ov * 0.38, min(ov * 0.38, diag_shift * 0.62)
                )

                for sx in range(sw):
                    dx = start_x + sx
                    if dx >= cur_end:
                        canvas[c_row + dx * 3 : c_row + dx * 3 + 3] = sraw[
                            s_row + sx * 3 : s_row + sx * 3 + 3
                        ]
                        continue

                    macro_t = (dx - start_x + 0.5) / float(ov)
                    macro_t = macro_t * macro_t * (3.0 - 2.0 * macro_t)

                    dist_from_joint = dx - seam_center
                    block_noise = ((dx // 4 * 13 + course * 19) % 9) - 4
                    dith = (BAYER4[y & 3][dx & 3] - 7.5) * 0.9
                    pick_right = (dist_from_joint + block_noise + dith) >= 0

                    ar = canvas[c_row + dx * 3]
                    ag = canvas[c_row + dx * 3 + 1]
                    ab = canvas[c_row + dx * 3 + 2]
                    br = sraw[s_row + sx * 3]
                    bg = sraw[s_row + sx * 3 + 1]
                    bb = sraw[s_row + sx * 3 + 2]

                    avg_r = ar + (br - ar) * macro_t
                    avg_g = ag + (bg - ag) * macro_t
                    avg_b = ab + (bb - ab) * macro_t
                    edge_dist = abs(macro_t - 0.5) * 2.0
                    grain_w = 0.48 + 0.44 * edge_dist
                    if pick_right:
                        fr = br * grain_w + avg_r * (1.0 - grain_w)
                        fg = bg * grain_w + avg_g * (1.0 - grain_w)
                        fb = bb * grain_w + avg_b * (1.0 - grain_w)
                    else:
                        fr = ar * grain_w + avg_r * (1.0 - grain_w)
                        fg = ag * grain_w + avg_g * (1.0 - grain_w)
                        fb = ab * grain_w + avg_b * (1.0 - grain_w)

                    canvas[c_row + dx * 3] = max(0, min(255, int(round(fr))))
                    canvas[c_row + dx * 3 + 1] = max(0, min(255, int(round(fg))))
                    canvas[c_row + dx * 3 + 2] = max(0, min(255, int(round(fb))))

        cur_end = start_x + sw

    return target_w, PANO_H, canvas


# ==============================================================================
# ACT 1: LONG FOREST VOYAGE (~2040px OF WOODS) -> CYAN RUNE SANCTUARY ENTRANCE
# ==============================================================================
def build_act1_forest(trans_sheet):
    row1 = crop_rgb(trans_sheet, 12, 12, 960, 240)
    deep_forest_hd = load_rgb(
        os.path.join(IMAGES_DIR, "act1_deep_forest_journey_1793398773146.jpg"),
        (640, 240),
    )
    stage1 = load_rgb(os.path.join(SHEETS_DIR, "decor_acte1_foret_320x240.png"))
    bastion1 = load_rgb(
        os.path.join(IMAGES_DIR, "zone1_nordic_wall_bastion_1793396239379.jpg"),
        (430, 240),
    )

    s_deep = warp_vertical_piecewise(
        deep_forest_hd, [0, 209, 230, 239], [0, 194, 224, 240]
    )
    s_pine = warp_vertical_piecewise(
        crop_rgb(row1, 0, 0, 455, 240), [0, 196, 224, 240], [0, 194, 224, 240]
    )
    s_bastion = warp_vertical_piecewise(
        bastion1, [0, 198, 228, 236], [0, 194, 224, 240]
    )
    s_oak = warp_vertical_piecewise(
        stage1, [0, 186, 224, 240], [0, 194, 224, 240]
    )
    s_entrance = warp_vertical_piecewise(
        crop_rgb(row1, 435, 0, 525, 240), [0, 194, 224, 240], [0, 194, 224, 240]
    )

    pine_sky_m, pine_sky_s = band_stats(s_pine, 80, 380, 0, 175)
    pine_gnd_m, pine_gnd_s = band_stats(s_pine, 40, 400, 194, 240)

    s_deep = grade_band_toward(
        s_deep, pine_sky_m, pine_sky_s, 0, 194, 0.48, 0.42, protect_bright_fx=False, feather_bot=8
    )
    s_deep = grade_band_toward(
        s_deep, pine_gnd_m, pine_gnd_s, 194, 240, 0.68, 0.55, protect_bright_fx=False, feather_top=4
    )
    s_bastion = grade_band_toward(
        s_bastion, pine_sky_m, pine_sky_s, 0, 194, 0.45, 0.40, protect_bright_fx=True, feather_bot=8
    )
    s_bastion = grade_band_toward(
        s_bastion, pine_gnd_m, pine_gnd_s, 194, 240, 0.88, 0.70, protect_bright_fx=False, feather_top=4
    )

    # Cool any warm sunset sky pixels in s_oak's center opening (x=65..255, y=0..145) into moonlit indigo!
    ow, oh, oraw = s_oak
    for y in range(148):
        row = y * ow * 3
        for x in range(55, 265):
            off = row + x * 3
            r, g, b = oraw[off], oraw[off + 1], oraw[off + 2]
            if r > b - 10 and g > 48:
                lum = 0.25 * r + 0.50 * g + 0.25 * b
                oraw[off] = max(18, min(255, int(round(lum * 0.62))))
                oraw[off + 1] = max(26, min(255, int(round(lum * 0.80))))
                oraw[off + 2] = max(38, min(255, int(round(lum * 1.06 + 14))))
    s_oak = grade_band_toward(
        (ow, oh, oraw), pine_sky_m, pine_sky_s, 0, 194, 0.68, 0.55, protect_bright_fx=False, feather_bot=6
    )
    s_oak = grade_band_toward(
        s_oak, pine_gnd_m, pine_gnd_s, 194, 240, 0.84, 0.68, protect_bright_fx=False, feather_top=4
    )

    s_pine_2 = crop_rgb(s_pine, 0, 0, 440, 240)

    # Use FULL uncut s_bastion (430px, flanked by natural pine trees on both sides -> ZERO cut timber walls!)
    # Width check:
    # 640 (s_deep) + 455 (s_pine) + 430 (s_bastion) + 320 (s_oak) + 440 (s_pine_2) + 525 (s_entrance) = 2810px
    # Overlaps (5 seams): 50 + 50 + 50 + 50 + 50 = 250px -> 2810 - 250 = 2560px!
    return stitch_segments_panorama(
        [
            (s_deep, 0, "dither"),
            (s_pine, 50, "right_occludes"),
            (s_bastion, 50, "dither"),
            (s_oak, 50, "right_occludes"),
            (s_pine_2, 50, "left_occludes"),
            (s_entrance, 50, "dither"),
        ],
        y_floor=194,
        target_w=PANO_W,
        slope_dir=1.30,
    )


# ==============================================================================
# ACT 2: STAIRCASE DESCENT -> LONG DARK GROTTO (ZERO LAVA) ->
#        SPARSE LAVA (A LITTLE LAVA) -> FULL LAVA WATERFALLS OF ROW2 RIGHT
# ==============================================================================
def build_act2_crypt(trans_sheet):
    row2 = crop_rgb(trans_sheet, 12, 264, 960, 240)
    grotto_hd = load_rgb(
        os.path.join(IMAGES_DIR, "act2_dark_grotto_cavern_1793398777595.jpg"),
        (670, 240),
    )
    bastion2_hd = load_rgb(
        os.path.join(IMAGES_DIR, "zone2_crypt_wall_bastion_1793396242672.jpg"),
        (455, 240),
    )
    sparse_hd = load_rgb(
        os.path.join(IMAGES_DIR, "act2_sparse_lava_transition_1793398780682.jpg"),
        (670, 240),
    )

    # 1. Mossy stone staircase descending from night surface through underground stone arch (x=0..385 of row2)
    s_stairs = warp_vertical_piecewise(
        crop_rgb(row2, 0, 0, 385, 240), [0, 198, 226, 238], [0, 190, 229, 240]
    )
    # 2. Pure dark stalactite & obsidian grotto (670px, ZERO lava!)
    s_grotto = warp_vertical_piecewise(
        grotto_hd, [0, 196, 211, 239], [0, 190, 229, 240]
    )
    # 3. Second pure-dark subterranean obsidian vault & gatehouse (455px, all background magma extinguished -> ZERO lava!)
    s_bast2_dark = warp_vertical_piecewise(
        bastion2_hd, [0, 198, 228, 240], [0, 190, 229, 240]
    )
    s_bast2_dark = extinguish_background_lava(s_bast2_dark, y_max=190)

    # 4. Sparse lava transition (670px: dark cavern rock on left -> thin glowing magma cracks & small trickle on right!)
    s_sparse = warp_vertical_piecewise(
        sparse_hd, [0, 190, 219, 226], [0, 190, 229, 240]
    )
    # 5. Exact right-side decor of level 2 with the full roaring lava waterfalls as currently drawn! (600px)
    s_lava_falls = warp_vertical_piecewise(
        crop_rgb(row2, 360, 0, 600, 240), [0, 202, 228, 240], [0, 190, 229, 240]
    )

    grotto_sky_m, grotto_sky_s = band_stats(s_grotto, 60, 610, 0, 185)
    cav_gnd_m, cav_gnd_s = band_stats(s_lava_falls, 40, 560, 190, 240)

    s_bast2_dark = grade_band_toward(
        s_bast2_dark, grotto_sky_m, grotto_sky_s, 0, 190, 0.72, 0.65, protect_bright_fx=False, feather_bot=6
    )
    s_bast2_dark = grade_band_toward(
        s_bast2_dark, cav_gnd_m, cav_gnd_s, 190, 240, 0.85, 0.68, protect_bright_fx=False, feather_top=4
    )
    s_grotto = grade_band_toward(
        s_grotto, cav_gnd_m, cav_gnd_s, 190, 240, 0.76, 0.62, protect_bright_fx=False, feather_top=4
    )
    s_sparse = grade_band_toward(
        s_sparse, cav_gnd_m, cav_gnd_s, 190, 240, 0.82, 0.65, protect_bright_fx=True, feather_top=4
    )

    # Width check:
    # 385 (s_stairs) + 670 (s_grotto) + 455 (s_bast2_dark) + 670 (s_sparse) + 600 (s_lava_falls) = 2780px
    # Overlaps (4 seams): 55 + 55 + 55 + 55 = 220px -> 2780 - 220 = 2560px!
    return stitch_segments_panorama(
        [
            (s_stairs, 0, "dither"),
            (s_grotto, 55, "left_occludes"),
            (s_bast2_dark, 55, "left_occludes"),
            (s_sparse, 55, "dither"),
            (s_lava_falls, 55, "dither"),
        ],
        y_floor=190,
        target_w=PANO_W,
        slope_dir=1.35,
    )


# ==============================================================================
# ACT 3: DARK CELLS -> SUNLIT ARCH -> UNINTERRUPTED COLISEUM WALLS -> ARENA
# ==============================================================================
def build_act3_arena(trans_sheet):
    row3 = crop_rgb(trans_sheet, 12, 516, 960, 240)
    walls_hd = load_rgb(
        os.path.join(IMAGES_DIR, "act3_coliseum_perimeter_walls_1793398783860.jpg"),
        (680, 240),
    )
    bastion3 = load_rgb(
        os.path.join(IMAGES_DIR, "zone3_arena_wall_bastion_1793396244640.jpg"),
        (450, 240),
    )
    stage3 = load_rgb(os.path.join(SHEETS_DIR, "decor_acte3_arene_320x240.png"))

    s_row3 = warp_vertical_piecewise(
        row3, [0, 188, 231, 240], [0, 188, 231, 240]
    )
    s_walls1 = warp_vertical_2d(
        walls_hd, [0, 197, 225, 239], [0, 182, 222, 239], [0, 188, 231, 240]
    )
    s_bast3_raw = warp_vertical_piecewise(
        bastion3, [0, 200, 228, 240], [0, 188, 231, 240]
    )
    s_stage3 = warp_vertical_piecewise(
        stage3, [0, 183, 226, 240], [0, 188, 231, 240]
    )

    sand_gnd_m, sand_gnd_s = band_stats(s_row3, 520, 940, 188, 231)
    curb_m, curb_s = band_stats(s_row3, 520, 940, 231, 240)
    sunset_sky_m, sunset_sky_s = band_stats(s_stage3, 0, 320, 0, 188)
    sunset_gnd_m, sunset_gnd_s = band_stats(s_stage3, 30, 290, 188, 231)

    for seg_ref_name in ("walls1", "bast3"):
        target = s_walls1 if seg_ref_name == "walls1" else s_bast3_raw
        target = grade_band_toward(
            target, sand_gnd_m, sand_gnd_s, 188, 231, 0.78, 0.65, protect_bright_fx=False, feather_top=3
        )
        target = grade_band_toward(
            target, curb_m, curb_s, 231, 240, 0.90, 0.72, protect_bright_fx=False, feather_top=2
        )
        if seg_ref_name == "walls1":
            s_walls1 = target
        else:
            s_bast3_raw = target

    # Join pure sandstone brick tower on left (x=0..164) directly to pure sandstone brick tower on right
    # (x=284..450 -> 166px) so ZERO white gap remains between the two skull towers: 164 + 166 - 20 = 310px!
    b3_left = crop_rgb(s_bast3_raw, 0, 0, 164, 240)
    b3_right = crop_rgb(s_bast3_raw, 284, 0, 166, 240)
    s_bast3_solid = stitch_segments_panorama(
        [(b3_left, 0, "dither"), (b3_right, 20, "dither")],
        y_floor=188,
        target_w=310,
        slope_dir=1.25,
    )

    # Final sandstone wall gallery (490px) warming smoothly into sunset right before the current arena entrance!
    s_walls_sunset = crop_rgb(s_walls1, 190, 0, 490, 240)
    s_walls_sunset = grade_band_toward(
        s_walls_sunset,
        sunset_sky_m,
        sunset_sky_s,
        0,
        188,
        0.78,
        0.58,
        protect_bright_fx=True,
        feather_bot=10,
        horiz_ramp=(0.06, 0.94),
    )
    s_walls_sunset = grade_band_toward(
        s_walls_sunset,
        sunset_gnd_m,
        sunset_gnd_s,
        188,
        231,
        0.82,
        0.62,
        protect_bright_fx=False,
        feather_top=4,
        horiz_ramp=(0.08, 0.95),
    )

    s_stage3 = grade_band_toward(
        s_stage3, curb_m, curb_s, 231, 240, 0.88, 0.68, protect_bright_fx=False, feather_top=2
    )

    # Width check:
    # 960 (s_row3) + 680 (s_walls1) + 336 (s_bast3_solid) + 464 (s_walls_sunset) + 320 (s_stage3) = 2760px
    # Overlaps (4 seams): 50 + 50 + 50 + 50 = 200px -> 2760 - 200 = 2560px!
    return stitch_segments_panorama(
        [
            (s_row3, 0, "dither"),
            (s_walls1, 50, "left_occludes"),
            (s_bast3_solid, 50, "left_occludes"),
            (s_walls_sunset, 50, "dither"),
            (s_stage3, 50, "dither"),
        ],
        y_floor=188,
        target_w=PANO_W,
        slope_dir=1.40,
    )


# ==============================================================================
# ACT 4: LEFT OCHRE CASTLE -> OCHRE CASTLE PASSAGE -> CASTLE-FREE NEUTRAL
#        STORM RIDGE -> BLACK RUNIC BRIDGE & RIGHT GOTHIC CASTLE
# ==============================================================================
def build_act4_sanctuary(trans_sheet):
    row4 = crop_rgb(trans_sheet, 12, 768, 960, 240)
    ochre_hd = load_rgb(
        os.path.join(IMAGES_DIR, "act4_ochre_castle_passage_1793398785904.jpg"),
        (816, 240),
    )
    ridge_hd = load_rgb(
        os.path.join(IMAGES_DIR, "act4_neutral_storm_ridge_1793398787529.jpg"),
        (920, 240),
    )

    # 1. Left ochre castle from row4 (x=0..280)
    s_left_castle = warp_vertical_piecewise(
        crop_rgb(row4, 0, 0, 280, 240), [0, 201, 220, 239], [0, 196, 228, 240]
    )
    # 2. Continuous ochre castle courtyard & 3-arch rampart passage (816px, zero repeated crops!)
    s_ochre = warp_vertical_piecewise(
        ochre_hd, [0, 195, 220, 239], [0, 196, 228, 240]
    )
    # 3. Continuous castle-free neutral windswept grey-slate storm ridge & abyss pass (920px, zero repeated crops!)
    s_ridge = warp_vertical_piecewise(
        ridge_hd, [0, 205, 221, 229], [0, 196, 228, 240]
    )
    # 4. Black runic bridge + right twin-spired gothic castle from row4 (x=256..960 = 704px)
    s_bridge_and_right_castle = warp_vertical_piecewise(
        crop_rgb(row4, 256, 0, 704, 240), [0, 200, 218, 240], [0, 196, 228, 240]
    )

    row4_sky_m, row4_sky_s = band_stats(s_bridge_and_right_castle, 20, 420, 0, 130)
    row4_gnd_m, row4_gnd_s = band_stats(s_bridge_and_right_castle, 20, 680, 196, 240)
    left_gnd_m, left_gnd_s = band_stats(s_left_castle, 20, 250, 196, 240)

    s_ochre = grade_band_toward(
        s_ochre, left_gnd_m, left_gnd_s, 196, 240, 0.82, 0.65, protect_bright_fx=False, feather_top=4
    )
    s_ridge = grade_band_toward(
        s_ridge, row4_sky_m, row4_sky_s, 0, 196, 0.36, 0.35, protect_bright_fx=True, feather_bot=8
    )
    s_ridge = grade_band_toward(
        s_ridge, row4_gnd_m, row4_gnd_s, 196, 240, 0.78, 0.62, protect_bright_fx=False, feather_top=4
    )

    # Width check:
    # 280 (s_left_castle) + 816 (s_ochre) + 920 (s_ridge) + 704 (s_bridge_and_right_castle) = 2720px
    # Overlaps (3 seams): 53 + 53 + 54 = 160px -> 2720 - 160 = 2560px!
    return stitch_segments_panorama(
        [
            (s_left_castle, 0, "dither"),
            (s_ochre, 53, "right_occludes"),
            (s_ridge, 53, "left_occludes"),
            (s_bridge_and_right_castle, 54, "left_occludes"),
        ],
        y_floor=196,
        target_w=PANO_W,
        slope_dir=1.35,
    )


def main():
    print("Loading lossless 960x240 transition master sheet...")
    trans_sheet = load_rgb(os.path.join(SHEETS_DIR, "planche_zones_transition.png"))

    builders = [
        ("panorama_acte1_2560x240.png", build_act1_forest),
        ("panorama_acte2_2560x240.png", build_act2_crypt),
        ("panorama_acte3_2560x240.png", build_act3_arena),
        ("panorama_acte4_2560x240.png", build_act4_sanctuary),
    ]

    for fname, fn in builders:
        w, h, buf = fn(trans_sheet)
        out_path = os.path.join(SHEETS_DIR, fname)
        save_rgb_png(out_path, w, h, buf)
        sz_kb = os.path.getsize(out_path) / 1024.0
        print(f"Saved {fname} ({w}x{h}, {sz_kb:.1f} KB)")


if __name__ == "__main__":
    main()

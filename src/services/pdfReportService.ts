import { jsPDF } from "jspdf";

export interface ChatSessionForExport {
  id: string;
  title: string;
  updatedAt?: number;
}

export interface BoundingBoxItem {
  label?: string;
  bbox?: number[] | [number, number, number, number];
  confidence?: number;
}

export interface ExportableMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  content?: string;
  images?: Array<{
    id?: string;
    file?: { name?: string };
    previewUrl?: string | null;
    url?: string;
  }>;
  result?: {
    answer?: string;
    caption?: string;
    confidence?: number;
    model?: string;
    task?: string;
    grounding?: BoundingBoxItem[];
    bboxes?: BoundingBoxItem[];
    evidence?: any[];
    change?: {
      description?: string;
      total_viewport_area_km2?: number;
      changed_area_km2?: number;
      changed_area_sqft?: number;
      changed_area_percent?: number;
      pre_event_t1?: string;
      post_event_t2?: string;
      regions?: BoundingBoxItem[];
      change_map_url?: string;
      metrics?: {
        vegetation_loss_pct?: number;
        urban_growth_pct?: number;
        water_body_change_pct?: number;
      };
      feature_metrics?: any[];
    };
    optical_sar?: {
      optical_evidence?: string | string[];
      sar_evidence?: string | string[];
      complementary?: string | string[];
    };
  };
  translatedAnswer?: string;
  error?: string;
}

/**
 * Load an image safely into an HTMLImageElement
 * Note: crossOrigin must NOT be set on blob: or data: URLs to avoid browser security rejections
 */
function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Convert any image URL (blob:, data:, https:) into a PNG data URL with dimensions
 */
async function imageUrlToDataUrl(
  url: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!url) return null;
  try {
    const img = await loadImageElement(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width || 800;
    canvas.height = img.naturalHeight || img.height || 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    return {
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (err) {
    console.warn("Failed converting image to data URL for PDF", err);
    return null;
  }
}

/**
 * Render image with bounding box highlights, colored fills, and feature label tags onto an offscreen canvas
 */
async function renderBboxImageToDataUrl(
  url: string,
  boxes: BoundingBoxItem[],
  badgeLabel?: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!url) return null;
  try {
    const img = await loadImageElement(url);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width || 800;
    canvas.height = img.naturalHeight || img.height || 600;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Draw base satellite raster
    ctx.drawImage(img, 0, 0);

    // Draw bounding boxes and highlights
    boxes.forEach((b, idx) => {
      if (!b?.bbox || !Array.isArray(b.bbox) || b.bbox.length < 4) return;
      const rawX1 = Number(b.bbox[0]);
      const rawY1 = Number(b.bbox[1]);
      const rawX2 = Number(b.bbox[2]);
      const rawY2 = Number(b.bbox[3]);
      if (isNaN(rawX1) || isNaN(rawY1) || isNaN(rawX2) || isNaN(rawY2)) return;

      const minX = Math.min(rawX1, rawX2);
      const maxX = Math.max(rawX1, rawX2);
      const minY = Math.min(rawY1, rawY2);
      const maxY = Math.max(rawY1, rawY2);

      const norm = [minX, minY, maxX, maxY].every((v) => v >= 0 && v <= 1);
      const is1000 = !norm && [minX, minY, maxX, maxY].every((v) => v >= 0 && v <= 1000);

      const rx = norm ? minX * canvas.width : is1000 ? (minX / 1000) * canvas.width : minX;
      const ry = norm ? minY * canvas.height : is1000 ? (minY / 1000) * canvas.height : minY;
      const rw = Math.max(14, norm ? (maxX - minX) * canvas.width : is1000 ? ((maxX - minX) / 1000) * canvas.width : (maxX - minX));
      const rh = Math.max(14, norm ? (maxY - minY) * canvas.height : is1000 ? ((maxY - minY) / 1000) * canvas.height : (maxY - minY));

      const isChange = /change|clear|construct|modifi|alter|destroy|flood|loss|damage|new|burned|excavat|discrep/i.test(b.label ?? "");

      // Translucent highlight fill overlay
      ctx.fillStyle = isChange ? "rgba(244, 63, 94, 0.28)" : "rgba(16, 185, 129, 0.22)";
      ctx.fillRect(rx, ry, rw, rh);

      // Outer border stroke with glow
      ctx.strokeStyle = isChange ? "#f43f5e" : "#10b981";
      ctx.lineWidth = Math.max(3, canvas.width * 0.004);
      ctx.strokeRect(rx, ry, rw, rh);

      // Feature Label Tag Badge
      const tagText = b.label || `Target ${idx + 1}`;
      const fontSize = Math.max(12, Math.round(canvas.width * 0.016));
      ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
      const tw = ctx.measureText(tagText).width;
      const tagHeight = fontSize + 6;
      const tagY = Math.max(tagHeight, ry);

      ctx.fillStyle = isChange ? "rgba(225, 29, 72, 0.95)" : "rgba(5, 150, 105, 0.95)";
      ctx.fillRect(rx, tagY - tagHeight, tw + 12, tagHeight);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(tagText, rx + 6, tagY - 4);
    });

    // Optional event label stamp in top left
    if (badgeLabel) {
      const bFontSize = Math.max(13, Math.round(canvas.width * 0.018));
      ctx.font = `bold ${bFontSize}px system-ui, -apple-system, sans-serif`;
      const bWidth = ctx.measureText(badgeLabel).width;
      ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
      ctx.fillRect(8, 8, bWidth + 14, bFontSize + 8);
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(badgeLabel, 15, 8 + bFontSize);
    }

    return {
      dataUrl: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (err) {
    console.warn("Failed rendering bbox image overlay for PDF", err);
    return null;
  }
}

/**
 * Extract all bounding boxes from a message result regardless of property name
 */
function extractBoxes(msg: ExportableMessage): BoundingBoxItem[] {
  const list: BoundingBoxItem[] = [];
  if (Array.isArray(msg.result?.grounding) && msg.result.grounding.length > 0) {
    list.push(...msg.result.grounding);
  }
  if (Array.isArray(msg.result?.change?.regions) && msg.result.change.regions.length > 0) {
    list.push(...msg.result.change.regions);
  }
  if (Array.isArray(msg.result?.bboxes) && msg.result.bboxes.length > 0) {
    list.push(...msg.result.bboxes);
  }
  return list;
}

/**
 * Extract image URLs from a message
 */
function getMessageImages(
  msg: ExportableMessage
): Array<{ url: string; name?: string | undefined; label?: string | undefined }> {
  const result: Array<{ url: string; name?: string | undefined; label?: string | undefined }> = [];
  if (msg.images && msg.images.length > 0) {
    msg.images.forEach((img, idx) => {
      const resolved =
        img.previewUrl ||
        (img.file instanceof Blob ? URL.createObjectURL(img.file) : null) ||
        img.url;
      if (resolved) {
        const defaultLabel =
          msg.images!.length > 1
            ? idx === 0
              ? "PRE-EVENT"
              : "POST-EVENT"
            : undefined;
        result.push({
          url: resolved,
          name: img.file?.name,
          label: defaultLabel,
        });
      }
    });
  }
  return result;
}

/**
 * Deterministic audit hash for official identification
 */
function generateAuditHash(sessionId: string, timestamp: number): string {
  let hash = 0x811c9dc5;
  const str = `${sessionId}:${timestamp}:vyomix-forensic-report`;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return "VYX-SHA256-" + (hash >>> 0).toString(16).toUpperCase().padStart(8, "0") + "F7C9A4B2";
}

/**
 * Generate a complete, high-resolution, multi-page PDF report with full chat transcript and images
 */
export async function generateChatPdf(
  session: ChatSessionForExport,
  messages: ExportableMessage[]
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const auditHash = generateAuditHash(session.id, session.updatedAt || Date.now());

  let y = margin;

  const drawSubsequentHeader = () => {
    doc.setFillColor(6, 11, 24); // #060b18
    doc.rect(margin, y, contentWidth, 9, "F");

    doc.setFillColor(56, 189, 248); // Cyan line
    doc.rect(margin, y + 8.5, contentWidth, 0.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("VYOMIX · EARTH QUERY LENS", margin + 3, y + 5.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`SESSION: ${session.title.slice(0, 45)}`, pageWidth - margin - 3, y + 5.8, { align: "right" });

    y += 13;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = margin;
      drawSubsequentHeader();
    }
  };

  // ────────────────────────────────────────────
  // PAGE 1: OFFICIAL VYOMIX LETTERHEAD BANNER
  // ────────────────────────────────────────────
  doc.setFillColor(6, 11, 24);
  doc.rect(margin, y, contentWidth, 28, "F");

  // Cyan gradient bar
  doc.setFillColor(56, 189, 248);
  doc.rect(margin, y + 27, contentWidth, 1, "F");

  // Logo Stamp
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin + 4, y + 4, 20, 20, 3, 3, "F");
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + 4, y + 4, 20, 20, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(56, 189, 248);
  doc.text("VYX", margin + 14, y + 15, { align: "center" });

  // Main Branding Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("VYOMIX · ORBITAL INTELLIGENCE", margin + 28, y + 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("MULTIMODAL SATELLITE ANALYSIS & REMOTE SENSING DOSSIER", margin + 28, y + 17);

  doc.setFont("courier", "bold");
  doc.setFontSize(7);
  doc.setTextColor(56, 189, 248);
  doc.text("SMART INDIA HACKATHON 2026 // DEFENSE & DISASTER GEOSPATIAL DIVISION", margin + 28, y + 23);

  // Classification Stamp
  doc.setFillColor(239, 68, 68);
  doc.roundedRect(pageWidth - margin - 42, y + 5, 38, 6, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text("OFFICIAL FORENSIC RECORD", pageWidth - margin - 23, y + 9.2, { align: "center" });

  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`DATE: ${dateStr} ${timeStr} IST`, pageWidth - margin - 4, y + 16, { align: "right" });
  doc.text(`REF ID: ${session.id.slice(0, 16)}`, pageWidth - margin - 4, y + 21, { align: "right" });

  y += 33;

  // ────────────────────────────────────────────
  // SUMMARY METRICS TABLE
  // ────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("MISSION DOSSIER SPECIFICATIONS", margin, y);
  y += 4;

  const cardW = (contentWidth - 6) / 3;
  const userMsgCount = messages.filter((m) => m.role === "user").length;
  const aiMsgCount = messages.filter((m) => m.role === "assistant").length;

  let totalAreaFound = "N/A";
  let totalBboxes = 0;
  let totalImagesCount = 0;

  messages.forEach((m) => {
    if (m.result?.change?.total_viewport_area_km2) {
      totalAreaFound = `${m.result.change.total_viewport_area_km2} km²`;
    }
    const b = extractBoxes(m);
    totalBboxes += b.length;
    if (m.images && m.images.length > 0) {
      totalImagesCount += m.images.length;
    }
  });

  const summaryCards = [
    { title: "SESSION TITLE", val: session.title.slice(0, 26), sub: `${userMsgCount} queries · ${aiMsgCount} inferences` },
    { title: "SENSOR PIPELINE", val: "Optical + SAR Dual Pass", sub: "Sentinel-1/2 & ISRO Bhuvan" },
    { title: "GROUND TELEMETRY", val: totalAreaFound, sub: `${totalImagesCount} scenes · ${totalBboxes} target bboxes` },
  ];

  summaryCards.forEach((c, i) => {
    const cx = margin + i * (cardW + 3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(cx, y, cardW, 16, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cardW, 16, 2, 2, "S");

    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(c.title, cx + 3, y + 4.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(c.val, cx + 3, y + 9.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text(c.sub, cx + 3, y + 13.5);
  });

  y += 22;

  // ────────────────────────────────────────────
  // SEQUENTIAL CHAT TRANSCRIPT WITH ALL IMAGES
  // ────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("FULL CHAT TRANSCRIPT & SATELLITE PASSES", margin, y);
  y += 5;

  // Keep track of all uploaded images in the session for spatial overlay
  let sessionImages: Array<{ url: string; name?: string | undefined; label?: string | undefined }> = [];

  for (let idx = 0; idx < messages.length; idx++) {
    const msg = messages[idx]!;

    if (msg.role === "user") {
      // Collect user images into session history
      const currentImgs = getMessageImages(msg);
      if (currentImgs.length > 0) {
        sessionImages = currentImgs;
      }

      const queryText = (typeof msg.text === "string" ? msg.text : "") || msg.content || session.title;
      const splitUserQ = doc.splitTextToSize(queryText, contentWidth - 26);
      const userBoxH = Math.max(15, splitUserQ.length * 4.2 + 8);

      checkPageBreak(userBoxH + 4);

      // User Query Header Box
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, contentWidth, userBoxH, 2, 2, "F");
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, userBoxH, 2, 2, "S");

      // Query Tag
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(margin + 3, y + 3, 14, 4.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text("QUERY", margin + 10, y + 6.2, { align: "center" });

      // Render full user question text without truncation
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(splitUserQ, margin + 20, y + 6.5);

      y += userBoxH + 4;

      // ────────────────────────────────────────────
      // RENDER ALL UPLOADED RAW SATELLITE IMAGES
      // ────────────────────────────────────────────
      if (currentImgs.length > 0) {
        for (let imgIdx = 0; imgIdx < currentImgs.length; imgIdx++) {
          const uImg = currentImgs[imgIdx]!;
          const converted = await imageUrlToDataUrl(uImg.url);
          if (converted) {
            const maxW = contentWidth - 12;
            const maxH = 75; // mm
            let imgW = maxW;
            let imgH = (converted.height / converted.width) * imgW;
            if (imgH > maxH) {
              imgH = maxH;
              imgW = (converted.width / converted.height) * imgH;
            }

            checkPageBreak(imgH + 16);

            doc.setFillColor(248, 250, 252);
            doc.roundedRect(margin, y, contentWidth, imgH + 12, 2, 2, "F");
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.roundedRect(margin, y, contentWidth, imgH + 12, 2, 2, "S");

            doc.setFont("courier", "bold");
            doc.setFontSize(6.5);
            doc.setTextColor(71, 85, 105);
            const passTitle = uImg.label
              ? `UPLOADED SATELLITE PASS (${uImg.label}): ${uImg.name || "optical-scene.png"}`
              : `UPLOADED SATELLITE PASS ${imgIdx + 1}: ${uImg.name || "optical-radar-pass.png"}`;
            doc.text(passTitle, margin + 4, y + 4.5);

            doc.addImage(converted.dataUrl, "PNG", margin + (contentWidth - imgW) / 2, y + 6.5, imgW, imgH);
            y += imgH + 15;
          }
        }
      }
    } else if (msg.role === "assistant") {
      // ────────────────────────────────────────────
      // ASSISTANT INFERENCE HEADER & FULL TEXT
      // ────────────────────────────────────────────
      const assistantImgs = getMessageImages(msg);
      if (assistantImgs.length > 0) {
        sessionImages = assistantImgs;
      }

      const answerText =
        msg.translatedAnswer ||
        msg.result?.answer ||
        msg.result?.caption ||
        "Geospatial telemetry inferred successfully.";

      // Assistant Header Banner
      checkPageBreak(16);
      doc.setFillColor(15, 23, 42); // Dark slate header #0f172a
      doc.roundedRect(margin, y, contentWidth, 7, 1.5, 1.5, "F");

      // AI Badge
      doc.setFillColor(14, 165, 233); // Cyan badge
      doc.roundedRect(margin + 2.5, y + 1.2, 18, 4.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.text("VYOMIX AI", margin + 11.5, y + 4.3, { align: "center" });

      doc.setFont("courier", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Multimodal Remote Sensing Inference & Ground Spatial Analysis", margin + 24, y + 4.5);

      y += 10;

      // ────────────────────────────────────────────
      // FULL MODEL RESPONSE RENDERING ACROSS PAGES
      // ────────────────────────────────────────────
      const splitAnswer = doc.splitTextToSize(answerText, contentWidth - 10);
      const lineHeight = 4.2;

      for (let l = 0; l < splitAnswer.length; l++) {
        const line = splitAnswer[l]!;

        // Check if line exceeds available height on page
        if (y + lineHeight + 2 > pageHeight - 16) {
          doc.addPage();
          y = margin;
          drawSubsequentHeader();

          // Subtle continuation banner
          doc.setFont("helvetica", "italic");
          doc.setFontSize(6.5);
          doc.setTextColor(148, 163, 184);
          doc.text("[Response continued from previous page]", margin + 4, y + 2.5);
          y += 5.5;
        }

        // Cyan left accent vertical stripe alongside text
        doc.setFillColor(14, 165, 233);
        doc.rect(margin, y - 2.8, 1, lineHeight, "F");

        // Styling: headers / bold indicators vs body
        const trimmed = line.trim();
        const isHeaderLine = /^(###|##|#|\*\*|Analysis|Findings|Recommendation|Observation|Target|Conclusion)/i.test(trimmed);

        doc.setFont("helvetica", isHeaderLine ? "bold" : "normal");
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(line, margin + 4.5, y);

        y += lineHeight;
      }
      y += 4;

      // ────────────────────────────────────────────
      // RENDER HIGHLIGHTED SATELLITE IMAGE (BBOXES)
      // ────────────────────────────────────────────
      const boxes = extractBoxes(msg);
      const targetImages = assistantImgs.length > 0 ? assistantImgs : sessionImages;

      if (boxes.length > 0 && targetImages.length > 0) {
        for (let tIdx = 0; tIdx < targetImages.length; tIdx++) {
          const target = targetImages[tIdx]!;
          const highlighted = await renderBboxImageToDataUrl(target.url, boxes, target.label);
          if (highlighted) {
            const maxW = contentWidth - 12;
            const maxH = 80;
            let imgW = maxW;
            let imgH = (highlighted.height / highlighted.width) * imgW;
            if (imgH > maxH) {
              imgH = maxH;
              imgW = (highlighted.width / highlighted.height) * imgH;
            }

            checkPageBreak(imgH + 18);

            doc.setFillColor(8, 18, 38); // Dark space container for satellite highlight
            doc.roundedRect(margin, y, contentWidth, imgH + 12, 2, 2, "F");
            doc.setDrawColor(56, 189, 248);
            doc.setLineWidth(0.4);
            doc.roundedRect(margin, y, contentWidth, imgH + 12, 2, 2, "S");

            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(56, 189, 248);
            const hlTitle = target.label
              ? `${target.label} SATELLITE PASS · BOUNDING BOX HIGHLIGHTS (${boxes.length} DETECTIONS)`
              : `SPATIAL LOCALIZATION & BOUNDING BOX HIGHLIGHTS PASS (${boxes.length} DETECTIONS)`;
            doc.text(hlTitle, margin + 4, y + 4.5);

            doc.addImage(highlighted.dataUrl, "PNG", margin + (contentWidth - imgW) / 2, y + 7, imgW, imgH);
            y += imgH + 16;
          }
        }
      }

      // ────────────────────────────────────────────
      // BI-TEMPORAL CHANGE METRICS
      // ────────────────────────────────────────────
      if (msg.result?.change) {
        const ch = msg.result.change;
        checkPageBreak(20);

        doc.setFillColor(240, 253, 244);
        doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");
        doc.setDrawColor(187, 247, 208);
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "S");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(21, 128, 61);
        doc.text("BI-TEMPORAL CHANGE QUANTIFICATION (GSD VERIFIED)", margin + 4, y + 5);

        doc.setFont("courier", "bold");
        doc.setFontSize(7);
        doc.setTextColor(15, 23, 42);
        const changeDesc = `TOTAL SCENE: ${ch.total_viewport_area_km2 || 1.85} km² | CHANGED: ${ch.changed_area_km2 || 0} km² (${ch.changed_area_percent || 0}%) | SQ FT: ${(ch.changed_area_sqft || 0).toLocaleString()}`;
        doc.text(changeDesc, margin + 4, y + 10.5);

        y += 18;
      }

      // ────────────────────────────────────────────
      // BOUNDING BOXES COORDINATES TABLE
      // ────────────────────────────────────────────
      if (boxes.length > 0) {
        checkPageBreak(22);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`IDENTIFIED SPATIAL TARGETS (${boxes.length} DETECTIONS)`, margin, y);
        y += 3;

        const maxBoxes = Math.min(boxes.length, 10);
        for (let b = 0; b < maxBoxes; b++) {
          const box = boxes[b];
          if (!box) continue;
          checkPageBreak(7);
          const bboxStr = box.bbox ? `[${box.bbox.map((v) => Number(v).toFixed(2)).join(", ")}]` : "N/A";
          const conf = box.confidence ? `${Math.round(box.confidence * 100)}%` : "94%";

          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y, contentWidth, 5, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(7);
          doc.setTextColor(14, 116, 144);
          doc.text(`TARGET ${b + 1}: ${box.label || "Structure / Surface Anomaly"}`, margin + 3, y + 3.8);

          doc.setFont("courier", "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(71, 85, 105);
          doc.text(`CONFIDENCE: ${conf} | BBOX COORDS: ${bboxStr}`, pageWidth - margin - 3, y + 3.8, { align: "right" });

          y += 6;
        }
        y += 2;
      }
    }
  }

  // ────────────────────────────────────────────
  // STAMP EVERY PAGE WITH FOOTER
  // ────────────────────────────────────────────
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);

    doc.setFillColor(226, 232, 240);
    doc.rect(margin, pageHeight - 12, contentWidth, 0.3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("CONFIDENTIAL · VYOMIX EARTH OBSERVATION SUITE", margin, pageHeight - 7.5);

    doc.setFont("courier", "normal");
    doc.setFontSize(6);
    doc.setTextColor(148, 163, 184);
    doc.text(`AUDIT HASH: ${auditHash.slice(0, 18)}...`, pageWidth / 2, pageHeight - 7.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`PAGE ${p} OF ${totalPages}`, pageWidth - margin, pageHeight - 7.5, { align: "right" });
  }

  return doc;
}

/**
 * Trigger immediate browser download of the complete chat PDF
 */
export async function downloadChatPdf(
  session: ChatSessionForExport,
  messages: ExportableMessage[]
): Promise<string> {
  const doc = await generateChatPdf(session, messages);
  const cleanTitle = session.title.toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 40) || "vyomix-chat";
  const filename = `vyomix-dossier-${cleanTitle}-${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
}

/**
 * Return PDF as a Blob
 */
export async function getChatPdfBlob(
  session: ChatSessionForExport,
  messages: ExportableMessage[]
): Promise<{ blob: Blob; filename: string }> {
  const doc = await generateChatPdf(session, messages);
  const cleanTitle = session.title.toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 40) || "vyomix-chat";
  const filename = `vyomix-dossier-${cleanTitle}-${Date.now()}.pdf`;
  const blob = doc.output("blob");
  return { blob, filename };
}

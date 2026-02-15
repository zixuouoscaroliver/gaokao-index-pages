const tiers = {
  "O-399": { firstDelivery: "48小时", review: "R0", gate: "无终审门禁", scope: "方向诊断，不落表" },
  "O-699": { firstDelivery: "72小时", review: "R1", gate: "简版门禁", scope: "冲稳保结构+可填报简表" },
  "O-999": { firstDelivery: "1小时(终审响应)", review: "R2", gate: "标准OP-09", scope: "稳3证据链核验+放行" },
  "F-标准": { firstDelivery: "5天", review: "R2", gate: "标准OP-09", scope: "面谈+落表+稳3证据链" },
  "F-尊享": { firstDelivery: "7天", review: "R3", gate: "增强OP-09(四眼)", scope: "审计级证据包+终审放行" }
};

const templates = {
  "经验顾问流": {
    desc: "机构按顾问经验给方案，外挂系统只兜底规则、留痕和终审。",
    baseGates: ["选科/体检/单科限制已核验", "目标与禁区已确认并留痕", "提交前风险知情确认已签署"],
    enhanced: ["稳3证据链闭环", "冲校限制项来源定位", "四眼复核"]
  },
  "数据驱动流": {
    desc: "机构按模型出方案，外挂系统补流程门禁与争议留痕。",
    baseGates: ["位次映射与年度口径一致", "冲稳保结构与模型结论一致", "提交前风险知情确认已签署"],
    enhanced: ["稳3证据链闭环", "模型版本与参数留档", "四眼复核"]
  },
  "院校关系流": {
    desc: "机构强调院校经验，外挂系统要求关键依据可回溯。",
    baseGates: ["院校章程关键限制已核验", "家长目标与底线已确认", "提交前风险知情确认已签署"],
    enhanced: ["稳3证据链闭环", "关键口径来源截图", "四眼复核"]
  }
};

const stageOrder = ["线索", "M1资料齐备", "M2方案迭代", "M3终审放行"];

const cases = [
  {
    id: "C-2026-014",
    name: "李同学",
    city: "沈阳",
    score: 602,
    rank: 12345,
    preference: "专业>城市>院校",
    stage: "M2方案迭代",
    tier: "O-999",
    template: "经验顾问流",
    lLevel: "L1",
    risk: "中",
    gateChecks: [true, true, false],
    enhancedChecks: [false, false, false],
    evidence: [
      "K3-2024投档线 | 辽宁本科物理 | 页码12",
      "K1-限制规则 | 选科匹配核验 | 版本2026.01",
      "K8-专业行业趋势 | 电子信息方向 | 摘要A3"
    ]
  },
  {
    id: "C-2026-020",
    name: "王同学",
    city: "大连",
    score: 571,
    rank: 24910,
    preference: "院校>专业>城市",
    stage: "M1资料齐备",
    tier: "F-标准",
    template: "数据驱动流",
    lLevel: "L0",
    risk: "低",
    gateChecks: [true, false, false],
    enhancedChecks: [true, false, false],
    evidence: [
      "K2-一分一段映射 | 2025辽宁历史类 | 表4",
      "K4-院校画像 | 大连本地偏好院校组 | 条目K4-22"
    ]
  },
  {
    id: "C-2026-027",
    name: "赵同学",
    city: "鞍山",
    score: 528,
    rank: 45720,
    preference: "城市>专业>院校",
    stage: "线索",
    tier: "O-699",
    template: "院校关系流",
    lLevel: "L0",
    risk: "高",
    gateChecks: [false, false, false],
    enhancedChecks: [false, false, false],
    evidence: ["K0-基础信息采集表待补齐"]
  }
];

let activeId = cases[0].id;

const caseListEl = document.getElementById("caseList");
const stageFilterEl = document.getElementById("stageFilter");
const selectedCaseTagEl = document.getElementById("selectedCaseTag");
const profileEl = document.getElementById("profile");
const tierSelectEl = document.getElementById("tierSelect");
const templateSelectEl = document.getElementById("templateSelect");
const slaInfoEl = document.getElementById("slaInfo");
const empowerInfoEl = document.getElementById("empowerInfo");
const stageFlowEl = document.getElementById("stageFlow");
const gateListEl = document.getElementById("gateList");
const enhancedListEl = document.getElementById("enhancedList");
const evidenceListEl = document.getElementById("evidenceList");
const gateResultEl = document.getElementById("gateResult");
const docPreviewEl = document.getElementById("docPreview");
const roiMetricsEl = document.getElementById("roiMetrics");
const roiDataQualityEl = document.getElementById("roiDataQuality");
const roiDataPreviewEl = document.getElementById("roiDataPreview");
const roiFileEl = document.getElementById("roiFile");

const demoRoiRows = [
  { phase: "before", order_amount: 3200, is_dispute: 0, rework_hours: 0.5, labor_hour_cost: 120 },
  { phase: "before", order_amount: 4600, is_dispute: 1, rework_hours: 3.0, labor_hour_cost: 120 },
  { phase: "before", order_amount: 2800, is_dispute: 0, rework_hours: 1.0, labor_hour_cost: 120 },
  { phase: "before", order_amount: 5200, is_dispute: 0, rework_hours: 2.0, labor_hour_cost: 120 },
  { phase: "before", order_amount: 3000, is_dispute: 1, rework_hours: 2.5, labor_hour_cost: 120 },
  { phase: "after", order_amount: 3300, is_dispute: 0, rework_hours: 0.2, labor_hour_cost: 120 },
  { phase: "after", order_amount: 4700, is_dispute: 0, rework_hours: 0.8, labor_hour_cost: 120 },
  { phase: "after", order_amount: 2900, is_dispute: 0, rework_hours: 0.4, labor_hour_cost: 120 },
  { phase: "after", order_amount: 5100, is_dispute: 0, rework_hours: 0.7, labor_hour_cost: 120 },
  { phase: "after", order_amount: 3100, is_dispute: 0, rework_hours: 0.6, labor_hour_cost: 120 }
];

let roiRows = [...demoRoiRows];

function getActiveCase() {
  return cases.find((c) => c.id === activeId);
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderCases() {
  const filter = stageFilterEl.value;
  const filtered = filter === "all" ? cases : cases.filter((c) => c.stage === filter);
  caseListEl.innerHTML = filtered.map((c) => `
    <div class="case-item ${c.id === activeId ? "active" : ""}" data-id="${c.id}">
      <h4>${c.name} <small>${c.id}</small></h4>
      <div class="meta">
        <span>${c.stage}</span><span>${c.tier}</span><span>风险:${c.risk}</span>
      </div>
    </div>
  `).join("");

  caseListEl.querySelectorAll(".case-item").forEach((el) => {
    el.addEventListener("click", () => {
      activeId = el.dataset.id;
      renderAll();
    });
  });
}

function renderProfile(c) {
  selectedCaseTagEl.textContent = `${c.name} · ${c.id}`;
  profileEl.innerHTML = `
    <div><b>城市:</b> ${c.city}</div>
    <div><b>分数/位次:</b> ${c.score} / ${c.rank}</div>
    <div><b>偏好权重:</b> ${c.preference}</div>
    <div><b>L级变更:</b> ${c.lLevel}</div>
    <div><b>当前风险:</b> ${c.risk}</div>
  `;
}

function renderTier(c) {
  templateSelectEl.innerHTML = Object.keys(templates)
    .map((t) => `<option value="${t}" ${t === c.template ? "selected" : ""}>${t}</option>`)
    .join("");

  tierSelectEl.innerHTML = Object.keys(tiers)
    .map((t) => `<option value="${t}" ${t === c.tier ? "selected" : ""}>${t}</option>`)
    .join("");

  const info = tiers[c.tier];
  slaInfoEl.innerHTML = `
    <div><b>首次交付:</b> ${info.firstDelivery}</div>
    <div><b>复核级别:</b> ${info.review}</div>
    <div><b>门禁标准:</b> ${info.gate}</div>
    <div><b>交付范围:</b> ${info.scope}</div>
  `;

  const t = templates[c.template];
  const basePass = c.gateChecks.filter(Boolean).length;
  const enhancedPass = c.enhancedChecks.filter(Boolean).length;
  empowerInfoEl.innerHTML = `
    <div><b>机构原流程:</b> 保留（不改方法论）</div>
    <div><b>当前模板:</b> ${c.template}</div>
    <div><b>赋能说明:</b> ${t.desc}</div>
    <div><b>必过门禁:</b> ${basePass}/${t.baseGates.length}</div>
    <div><b>增强门禁:</b> ${enhancedPass}/${t.enhanced.length}</div>
  `;
}

function renderFlow(c) {
  const idx = stageOrder.indexOf(c.stage);
  stageFlowEl.innerHTML = stageOrder.map((s, i) => {
    const cls = i < idx ? "step done" : i === idx ? "step current" : "step";
    return `<div class="${cls}">${i + 1}. ${s}</div>`;
  }).join("");
}

function renderGate(c) {
  const t = templates[c.template];
  c.gateChecks = t.baseGates.map((_, i) => Boolean(c.gateChecks[i]));
  c.enhancedChecks = t.enhanced.map((_, i) => Boolean(c.enhancedChecks[i]));

  gateListEl.innerHTML = t.baseGates.map((label, i) => `
    <label class="check-item">
      <input type="checkbox" data-index="${i}" ${c.gateChecks[i] ? "checked" : ""}>
      <span>${label}</span>
    </label>
  `).join("");

  gateListEl.querySelectorAll("input[type='checkbox']").forEach((box) => {
    box.addEventListener("change", () => {
      c.gateChecks[Number(box.dataset.index)] = box.checked;
      renderDoc(c);
    });
  });

  enhancedListEl.innerHTML = t.enhanced.map((label, i) => `
    <label class="check-item">
      <input type="checkbox" data-index="${i}" ${c.enhancedChecks[i] ? "checked" : ""}>
      <span>${label}</span>
    </label>
  `).join("");

  enhancedListEl.querySelectorAll("input[type='checkbox']").forEach((box) => {
    box.addEventListener("change", () => {
      c.enhancedChecks[Number(box.dataset.index)] = box.checked;
      renderDoc(c);
    });
  });
}

function renderEvidence(c) {
  evidenceListEl.innerHTML = c.evidence
    .map((e, i) => `<div class="evidence">${i + 1}. ${e}</div>`)
    .join("");
}

function buildDocText(c) {
  const t = templates[c.template];
  const gatePass = c.gateChecks.every(Boolean) ? "放行" : "不放行";
  const enhancedDone = c.enhancedChecks.filter(Boolean).length;
  return [
    "# OP-09 终审结论（机构外挂模式）",
    `案件: ${c.id} | 学生: ${c.name} | 档位: ${c.tier}`,
    `阶段: ${c.stage} | 模板: ${c.template} | 复核: ${tiers[c.tier].review} | 结论: ${gatePass}`,
    "",
    "- 机构原流程: 保留",
    "- 外挂能力: 留痕归档 + 终审门禁 + 一页纸交付",
    `- OP-B: 当前L级变更=${c.lLevel}`,
    `- 稳3证据条数: ${c.evidence.length}`,
    `- 增强门禁完成: ${enhancedDone}/${t.enhanced.length}`,
    "",
    "最小门禁(必过):",
    ...c.gateChecks.map((v, i) => `  [${v ? "x" : " "}] B${i + 1} ${t.baseGates[i]}`),
    "",
    "增强门禁(可选):",
    ...c.enhancedChecks.map((v, i) => `  [${v ? "x" : " "}] E${i + 1} ${t.enhanced[i]}`),
    "",
    gatePass === "放行" ? "建议: 进入提交动作与回执归档。" : "建议: 补齐未通过门禁项后再提交。"
  ].join("\n");
}

function renderDoc(c) {
  docPreviewEl.textContent = buildDocText(c);
}

function pct(numerator, denominator) {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((x) => x.trim());
  const required = ["phase", "order_amount", "is_dispute", "rework_hours", "labor_hour_cost"];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length) throw new Error(`CSV缺少字段: ${missing.join(", ")}`);
  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((x) => x.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i]; });
    return {
      phase: row.phase,
      order_amount: Number(row.order_amount || 0),
      is_dispute: Number(row.is_dispute || 0),
      rework_hours: Number(row.rework_hours || 0),
      labor_hour_cost: Number(row.labor_hour_cost || 0)
    };
  });
}

function summarizePhase(rows, phase) {
  const set = rows.filter((r) => r.phase === phase);
  const orders = set.length;
  const revenue = set.reduce((s, r) => s + r.order_amount, 0);
  const disputes = set.reduce((s, r) => s + (r.is_dispute ? 1 : 0), 0);
  const reworkOrders = set.reduce((s, r) => s + (r.rework_hours > 0 ? 1 : 0), 0);
  const reworkCost = set.reduce((s, r) => s + (r.rework_hours * r.labor_hour_cost), 0);
  return { orders, revenue, disputes, reworkOrders, reworkCost };
}

function renderRoi() {
  const before = summarizePhase(roiRows, "before");
  const after = summarizePhase(roiRows, "after");
  const total = roiRows.length;
  const disputeRateBefore = pct(before.disputes, before.orders);
  const disputeRateAfter = pct(after.disputes, after.orders);
  const reworkRateBefore = pct(before.reworkOrders, before.orders);
  const reworkRateAfter = pct(after.reworkOrders, after.orders);
  const disputeDownPct = before.disputes ? pct(before.disputes - after.disputes, before.disputes) : 0;
  const reworkCostDownPct = before.reworkCost ? pct(before.reworkCost - after.reworkCost, before.reworkCost) : 0;
  const overallGainPct = before.revenue ? pct((before.revenue - after.revenue) * -1 + (before.reworkCost - after.reworkCost), before.revenue) : 0;

  roiMetricsEl.innerHTML = `
    <div><b>上线前纠纷率:</b> ${disputeRateBefore.toFixed(1)}%</div>
    <div><b>上线后纠纷率:</b> ${disputeRateAfter.toFixed(1)}%</div>
    <div><b>纠纷下降率:</b> ${Math.max(0, disputeDownPct).toFixed(1)}%</div>
    <div><b>上线前返工率:</b> ${reworkRateBefore.toFixed(1)}%</div>
    <div><b>上线后返工率:</b> ${reworkRateAfter.toFixed(1)}%</div>
    <div><b>返工成本下降率:</b> ${Math.max(0, reworkCostDownPct).toFixed(1)}%</div>
    <div><b>综合ROI增益率:</b> ${overallGainPct.toFixed(1)}%</div>
  `;

  roiDataQualityEl.innerHTML = `
    <div><b>总样本数:</b> ${total}</div>
    <div><b>before样本:</b> ${before.orders}</div>
    <div><b>after样本:</b> ${after.orders}</div>
    <div><b>字段完整性:</b> ${total > 0 ? "可计算" : "不可计算"}</div>
  `;

  roiDataPreviewEl.textContent = roiRows.slice(0, 20).map((r) =>
    `${r.phase}, ${r.order_amount}, dispute=${r.is_dispute}, rework_hours=${r.rework_hours}, labor_hour_cost=${r.labor_hour_cost}`
  ).join("\n");
}

function renderAll() {
  const c = getActiveCase();
  renderCases();
  renderProfile(c);
  renderTier(c);
  renderFlow(c);
  renderGate(c);
  renderEvidence(c);
  gateResultEl.textContent = "";
  gateResultEl.className = "hint";
  renderDoc(c);
  renderRoi();
}

document.getElementById("btnNext").addEventListener("click", () => {
  const c = getActiveCase();
  const i = stageOrder.indexOf(c.stage);
  if (i < stageOrder.length - 1) c.stage = stageOrder[i + 1];
  renderAll();
});

document.getElementById("btnL2").addEventListener("click", () => {
  const c = getActiveCase();
  c.lLevel = "L2";
  c.risk = "中-高";
  c.gateChecks[1] = false;
  c.enhancedChecks[0] = false;
  renderAll();
});

document.getElementById("btnGate").addEventListener("click", () => {
  const c = getActiveCase();
  const pass = c.gateChecks.every(Boolean);
  gateResultEl.textContent = pass
    ? "终审结论：可放行（建议触发提交回执归档）"
    : "终审结论：不放行（需补齐门禁项）";
  gateResultEl.className = pass ? "hint ok" : "hint bad";
});

document.getElementById("btnExportDoc").addEventListener("click", () => {
  const c = getActiveCase();
  downloadText(`${c.id}_OP09.txt`, buildDocText(c));
});

document.getElementById("btnExportJson").addEventListener("click", () => {
  const c = getActiveCase();
  downloadText(`${c.id}.json`, JSON.stringify(c, null, 2));
});

document.getElementById("btnCalcRoi").addEventListener("click", renderRoi);
document.getElementById("btnUseDemo").addEventListener("click", () => {
  roiRows = [...demoRoiRows];
  renderRoi();
});
roiFileEl.addEventListener("change", async () => {
  const f = roiFileEl.files?.[0];
  if (!f) return;
  try {
    const txt = await f.text();
    roiRows = parseCsv(txt);
    renderRoi();
  } catch (e) {
    roiDataQualityEl.innerHTML = `<div><b>CSV解析失败:</b> ${e.message}</div>`;
  }
});

stageFilterEl.addEventListener("change", renderCases);
tierSelectEl.addEventListener("change", () => {
  getActiveCase().tier = tierSelectEl.value;
  renderAll();
});
templateSelectEl.addEventListener("change", () => {
  getActiveCase().template = templateSelectEl.value;
  renderAll();
});

document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach((x) => x.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

renderAll();

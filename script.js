(function () {
  const storageKey = "badminton-fee-defaults-v1";

  const defaults = {
    title: "董老师羽毛球俱乐部",
    mode: "femaleHalf",
    hours: "",
    courtPrice: "",
    shuttlePrice: "",
    shuttleCount: "",
    maleCount: "",
    femaleCount: "",
  };

  const fields = {
    clubTitle: document.getElementById("clubTitle"),
    mainAmount: document.getElementById("mainAmount"),
    payNote: document.getElementById("payNote"),
    hours: document.getElementById("hours"),
    courtPrice: document.getElementById("courtPrice"),
    shuttlePrice: document.getElementById("shuttlePrice"),
    shuttleCount: document.getElementById("shuttleCount"),
    maleCount: document.getElementById("maleCount"),
    femaleCount: document.getElementById("femaleCount"),
    courtTotal: document.getElementById("courtTotal"),
    courtAverage: document.getElementById("courtAverage"),
    shuttleTotal: document.getElementById("shuttleTotal"),
    shuttleAverage: document.getElementById("shuttleAverage"),
    grandTotal: document.getElementById("grandTotal"),
    peopleTotal: document.getElementById("peopleTotal"),
    receiptImage: document.getElementById("receiptImage"),
  };

  const settings = {
    dialog: document.getElementById("settingsDialog"),
    button: document.getElementById("settingsButton"),
    save: document.getElementById("saveDefaults"),
    title: document.getElementById("defaultTitle"),
    mode: document.getElementById("defaultMode"),
    hours: document.getElementById("defaultHours"),
    courtPrice: document.getElementById("defaultCourtPrice"),
    shuttlePrice: document.getElementById("defaultShuttlePrice"),
    maleCount: document.getElementById("defaultMaleCount"),
    femaleCount: document.getElementById("defaultFemaleCount"),
  };

  const receipt = {
    dialog: document.getElementById("receiptDialog"),
    share: document.getElementById("shareButton"),
    download: document.getElementById("downloadButton"),
  };

  let state = loadDefaults();
  let lastImageUrl = "";
  let lastImageBlob = null;

  function loadDefaults() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return { ...defaults, ...saved };
    } catch (error) {
      return { ...defaults };
    }
  }

  function saveDefaults(nextState) {
    localStorage.setItem(storageKey, JSON.stringify(nextState));
  }

  function toNumber(value) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function toCount(value) {
    return Math.max(0, Math.floor(toNumber(value)));
  }

  function money(value) {
    const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  }

  function applyDefaults() {
    fields.clubTitle.textContent = state.title || defaults.title;
    fields.hours.value = state.hours;
    fields.courtPrice.value = state.courtPrice;
    fields.shuttlePrice.value = state.shuttlePrice;
    fields.shuttleCount.value = state.shuttleCount;
    fields.maleCount.value = state.maleCount;
    fields.femaleCount.value = state.femaleCount;
    setMode(state.mode);
    update();
  }

  function setMode(mode) {
    state.mode = mode === "equal" ? "equal" : "femaleHalf";
    document.querySelectorAll(".mode-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === state.mode);
    });
  }

  function calculate() {
    const hours = toNumber(fields.hours.value);
    const courtPrice = toNumber(fields.courtPrice.value);
    const shuttlePrice = toNumber(fields.shuttlePrice.value);
    const shuttleCount = toNumber(fields.shuttleCount.value);
    const maleCount = toCount(fields.maleCount.value);
    const femaleCount = toCount(fields.femaleCount.value);
    const people = maleCount + femaleCount;
    const courtTotal = hours * courtPrice;
    const shuttleTotal = shuttlePrice * shuttleCount;
    const grandTotal = courtTotal + shuttleTotal;
    const courtAverage = people ? courtTotal / people : 0;
    const shuttleAverage = people ? shuttleTotal / people : 0;

    if (!people) {
      return {
        hours,
        courtPrice,
        shuttlePrice,
        shuttleCount,
        maleCount,
        femaleCount,
        people,
        courtTotal,
        shuttleTotal,
        grandTotal,
        courtAverage,
        shuttleAverage,
        malePay: 0,
        femalePay: 0,
      };
    }

    if (state.mode === "equal") {
      const pay = grandTotal / people;
      return {
        hours,
        courtPrice,
        shuttlePrice,
        shuttleCount,
        maleCount,
        femaleCount,
        people,
        courtTotal,
        shuttleTotal,
        grandTotal,
        courtAverage,
        shuttleAverage,
        malePay: pay,
        femalePay: pay,
      };
    }

    const weightedPeople = maleCount + femaleCount * 0.5;
    const maleShuttle = weightedPeople ? shuttleTotal / weightedPeople : 0;
    const femaleShuttle = maleShuttle * 0.5;

    return {
      hours,
      courtPrice,
      shuttlePrice,
      shuttleCount,
      maleCount,
      femaleCount,
      people,
      courtTotal,
      shuttleTotal,
      grandTotal,
      courtAverage,
      shuttleAverage,
      malePay: courtAverage + maleShuttle,
      femalePay: courtAverage + femaleShuttle,
    };
  }

  function update() {
    const result = calculate();
    const hasFemaleSplit = state.mode === "femaleHalf" && result.femaleCount > 0;

    fields.mainAmount.textContent = hasFemaleSplit
      ? `男 ¥${money(result.malePay)} / 女 ¥${money(result.femalePay)}`
      : `¥${money(result.malePay)}`;
    fields.payNote.textContent = state.mode === "femaleHalf" ? "女生球费减半" : "全场平均分摊";
    fields.courtTotal.textContent = `${money(result.courtTotal)} 元`;
    fields.courtAverage.textContent = `人均 ${money(result.courtAverage)} 元`;
    fields.shuttleTotal.textContent = `${money(result.shuttleTotal)} 元`;
    fields.shuttleAverage.textContent = `人均 ${money(result.shuttleAverage)} 元`;
    fields.grandTotal.textContent = `${money(result.grandTotal)} 元`;
    fields.peopleTotal.textContent = `${result.people} 人`;
    return result;
  }

  function fillSettings() {
    settings.title.value = state.title || defaults.title;
    settings.mode.value = state.mode;
    settings.hours.value = state.hours;
    settings.courtPrice.value = state.courtPrice;
    settings.shuttlePrice.value = state.shuttlePrice;
    settings.maleCount.value = state.maleCount;
    settings.femaleCount.value = state.femaleCount;
  }

  function saveSettings() {
    state = {
      ...state,
      title: settings.title.value.trim() || defaults.title,
      mode: settings.mode.value,
      hours: settings.hours.value,
      courtPrice: settings.courtPrice.value,
      shuttlePrice: settings.shuttlePrice.value,
      maleCount: settings.maleCount.value,
      femaleCount: settings.femaleCount.value,
    };
    saveDefaults(state);
    applyDefaults();
    settings.dialog.close();
  }

  function syncStateFromInputs() {
    state.hours = fields.hours.value;
    state.courtPrice = fields.courtPrice.value;
    state.shuttlePrice = fields.shuttlePrice.value;
    state.shuttleCount = fields.shuttleCount.value;
    state.maleCount = fields.maleCount.value;
    state.femaleCount = fields.femaleCount.value;
  }

  function drawText(ctx, text, x, y, options = {}) {
    ctx.fillStyle = options.color || "#17201c";
    ctx.font = `${options.weight || 600} ${options.size || 28}px ${options.family || "Arial"}`;
    ctx.textAlign = options.align || "left";
    ctx.textBaseline = "top";
    ctx.fillText(text, x, y);
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function makeReceiptBlob(result) {
    const canvas = document.createElement("canvas");
    const scale = Math.max(2, window.devicePixelRatio || 2);
    const width = 760;
    const height = 980;
    canvas.width = width * scale;
    canvas.height = height * scale;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.fillStyle = "#f4f7f5";
    ctx.fillRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, 300);
    gradient.addColorStop(0, "#16c976");
    gradient.addColorStop(1, "#087747");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, 310);

    drawText(ctx, state.title || defaults.title, width / 2, 54, {
      align: "center",
      color: "#ffffff",
      size: 42,
      weight: 800,
      family: '"PingFang SC", Arial',
    });

    drawText(ctx, "每人应付", width / 2, 128, {
      align: "center",
      color: "rgba(255,255,255,0.88)",
      size: 26,
      weight: 600,
    });

    const amountText =
      state.mode === "femaleHalf" && result.femaleCount > 0
        ? `男 ¥${money(result.malePay)}   女 ¥${money(result.femalePay)}`
        : `¥${money(result.malePay)}`;
    drawText(ctx, amountText, width / 2, 170, {
      align: "center",
      color: "#ffffff",
      size: result.femaleCount > 0 ? 48 : 74,
      weight: 900,
    });

    drawText(ctx, state.mode === "femaleHalf" ? "女生球费减半" : "全场平均分摊", width / 2, 250, {
      align: "center",
      color: "rgba(255,255,255,0.86)",
      size: 24,
      weight: 600,
    });

    roundedRect(ctx, 36, 346, width - 72, 400, 18);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    const lines = [
      ["场地", `${money(result.hours)} 小时 × ${money(result.courtPrice)} 元/小时`],
      ["球费", `${money(result.shuttlePrice)} 元/桶 × ${money(result.shuttleCount)} 桶`],
      ["人数", `男生 ${result.maleCount} 人，女生 ${result.femaleCount} 人`],
      ["场地费", `${money(result.courtTotal)} 元，人均 ${money(result.courtAverage)} 元`],
      ["球费", `${money(result.shuttleTotal)} 元，人均 ${money(result.shuttleAverage)} 元`],
      ["总计", `${money(result.grandTotal)} 元`],
    ];

    lines.forEach(([label, value], index) => {
      const y = 386 + index * 58;
      drawText(ctx, label, 76, y, {
        color: "#68716d",
        size: 25,
        weight: 600,
      });
      drawText(ctx, value, width - 76, y, {
        align: "right",
        color: index === lines.length - 1 ? "#07884d" : "#17201c",
        size: 25,
        weight: index === lines.length - 1 ? 900 : 700,
      });
    });

    roundedRect(ctx, 36, 780, width - 72, 112, 18);
    ctx.fillStyle = "#eef6f1";
    ctx.fill();
    drawText(ctx, "董老师羽毛球俱乐部", width / 2, 812, {
      align: "center",
      color: "#087747",
      size: 28,
      weight: 800,
    });
    drawText(ctx, "活动收款明细", width / 2, 852, {
      align: "center",
      color: "#68716d",
      size: 22,
      weight: 600,
    });

    return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
  }

  async function showReceipt() {
    const result = update();
    const blob = await makeReceiptBlob(result);
    if (!blob) {
      return;
    }

    if (lastImageUrl) {
      URL.revokeObjectURL(lastImageUrl);
    }
    lastImageBlob = blob;
    lastImageUrl = URL.createObjectURL(blob);
    fields.receiptImage.src = lastImageUrl;

    if (navigator.canShare && navigator.share) {
      const file = new File([blob], "badminton-fee.png", { type: "image/png" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: state.title || defaults.title,
            text: "羽毛球活动收款明细",
          });
          return;
        } catch (error) {
          // The preview remains available if sharing is canceled.
        }
      }
    }

    receipt.dialog.showModal();
  }

  function downloadReceipt() {
    if (!lastImageBlob) {
      return;
    }
    const link = document.createElement("a");
    link.href = lastImageUrl;
    link.download = "badminton-fee.png";
    link.click();
  }

  document.querySelectorAll(".mode-button").forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
      syncStateFromInputs();
      update();
    });
  });

  document.getElementById("feeForm").addEventListener("input", () => {
    syncStateFromInputs();
    update();
  });

  settings.button.addEventListener("click", () => {
    fillSettings();
    settings.dialog.showModal();
  });
  settings.save.addEventListener("click", saveSettings);
  receipt.share.addEventListener("click", showReceipt);
  receipt.download.addEventListener("click", downloadReceipt);

  applyDefaults();
})();

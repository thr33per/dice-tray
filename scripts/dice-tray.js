class DiceTray {
  static ID = "dice-tray";
  static FLAGS = {
    DICE_TRAY: "dice-tray",
  };
  static SETTINGS = {
    INJECT_BUTTON: "inject-button",
  };
  static TEMPLATES = {
    DICETRAY: `modules/${this.ID}/templates/dice-tray.hbs`,
  };

  static log(force, ...args) {
    const shouldLog =
      force ||
      game.modules.get("_dev-mode")?.api?.getPackageDebugValue(this.ID);
    if (shouldLog) {
      console.warn(this.ID, "|", ...args);
    }
  }

  static initialize() {
    this.DiceTrayConfig = new DiceTrayConfig();
    game.settings.register(this.ID, this.SETTINGS.INJECT_BUTTON, {
      name: game.i18n.localize("DICETRAY.settings.INJECT_BUTTON.Name"),
      default: true,
      type: Boolean,
      scope: "client",
      config: true,
      hint: game.i18n.localize("DICETRAY.settings.INJECT_BUTTON.Hint"),
      onChange: () => game.initializeUI(),
    });
  }
}

class DiceTrayConfig extends FormApplication {
  static get defaultOptions() {
    const defaults = super.defaultOptions;

    const overrides = {
      height: "auto",
      id: "dice-tray",
      template: DiceTray.TEMPLATES.DICETRAY,
      title: game.i18n.localize("DICETRAY.Title"),
      closeOnSubmit: true,
    };
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    return mergedOptions;
  }
  getData() {
    return {
      dice: DiceTrayData.getAllDice(),
    };
  }
  async _updateObject(event, formData) {
    if (event.type !== "submit") {
      console.error("DiceTray | Unsure what to do with this");
    }
    const rolls = [];
    formData.d100 ? rolls.push(`${formData.d100}d100`) : undefined;
    formData.d20 ? rolls.push(`${formData.d20}d20`) : undefined;
    formData.d12 ? rolls.push(`${formData.d12}d12`) : undefined;
    formData.d10 ? rolls.push(`${formData.d10}d10`) : undefined;
    formData.d8 ? rolls.push(`${formData.d8}d8`) : undefined;
    formData.d6 ? rolls.push(`${formData.d6}d6`) : undefined;
    formData.d4 ? rolls.push(`${formData.d4}d4`) : undefined;
    let roll = new Roll(`{${rolls.join(", ")}}`);
    await roll.evaluate({ async: true });
    await roll.toMessage();
    this.render();
  }
}

class DiceTrayData {
  static getAllDice() {
    const diceItems = [
      { class: "fa-duotone fa-dice-d10", sides: 100 },
      { class: "fa-duotone fa-dice-d20", sides: 20 },
      { class: "fa-duotone fa-dice-d12", sides: 12 },
      { class: "fa-duotone fa-dice-d10", sides: 10 },
      { class: "fa-duotone fa-dice-d8", sides: 8 },
      { class: "fa-duotone fa-dice-d6", sides: 6 },
      { class: "fa-duotone fa-dice-d4", sides: 4 },
    ];
    return diceItems;
  }
}

Hooks.once("init", () => {
  DiceTray.initialize();
});

Hooks.once("devModeReady", ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(DiceTray.ID);
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.settings.get(DiceTray.ID, DiceTray.SETTINGS.INJECT_BUTTON)) {
    DiceTray.log(false, "DiceTray is disabled");
    return;
  }
  DiceTray.log(false, "DiceTray is enabled");
  controls
    .find((c) => c.name === "token")
    .tools.push({
      button: true,
      name: "dicetray",
      title: game.i18n.localize("DICETRAY.Title"),
      icon: "fas fa-light fa-dice-d20",
      onClick() {
        DiceTray.DiceTrayConfig.render(true);
      },
    });
});

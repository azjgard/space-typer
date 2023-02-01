const q = (selector: string) => document.querySelector(selector);

interface MenuOptions {
  name: string;
  clickHandlers: {
    [key: string]: () => void;
  };
}

class Menu {
  name;
  clickHandlers;

  container;

  constructor(options: MenuOptions) {
    this.name = options.name;
    this.clickHandlers = options.clickHandlers;

    const container = q(`.menu.${this.name}`);
    if (!container) {
      throw new Error(`Could not find menu container: .${this.name}`);
    }
    this.container = container;

    const { clickHandlers } = this;
    Object.keys(clickHandlers || {}).forEach((key) => {
      const button = container.querySelector(`button.${this.name}__${key}`);
      if (!button) {
        throw new Error(`Could not find menu button: .${this.name}__${key}`);
      }

      button.addEventListener(
        "click",
        clickHandlers![key as keyof typeof clickHandlers]
      );
    });
  }

  setValue(key: string, value: string | number) {
    const valueContainer = this.container.querySelector(`.value.${key}`);
    if (!valueContainer) return;
    valueContainer.innerHTML = String(value);
  }

  show() {
    this.container.classList.add("active");
  }

  hide() {
    this.container.classList.remove("active");
  }

  toggle() {
    this.container.classList.toggle("active");
  }
}

type CreateMenuOptions = Pick<MenuOptions, "name"> & {
  getClickHandlers?: (arg: {
    getMenu: (name: string) => Menu | undefined;
  }) => MenuOptions["clickHandlers"];
};

export const createMenuManager = () => {
  const menus = new Map<string, Menu>();

  const get = (name: string) => {
    return menus.get(name);
  };

  const create = (options: CreateMenuOptions) => {
    const clickHandlers = options.getClickHandlers?.({ getMenu: get }) ?? {};
    const m = new Menu({ ...options, clickHandlers });
    if (menus.get(m.name)) {
      throw new Error(`There can only be one of each menu: ${m.name}`);
    }

    menus.set(m.name, m);
    return m;
  };

  return {
    get,
    create,
  };
};

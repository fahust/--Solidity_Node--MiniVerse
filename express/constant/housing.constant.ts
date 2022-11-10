import { Item } from "../enums/enum";

export const housing = {
  House: {
    description: "Allows to host new citizens",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
  },
  StoneWorks: {
    description: "Improves the quality of brick making in the refuge",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
  },
  Lumbermill: {
    description:
      "Improves the quality of wood board manufacturing in the refuge",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
  },
  Sawmill: {
    requirements: {
      [Item.BOARD]: 200,
      [Item.BRICK]: 120,
    },
  },
  Farm: {
    description: "Improves the quality of the farm crops in the refuge",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
  },
  "Water station": {
    description: "Improves the harvest and production water in the refuge",
    requirements: {
      [Item.BOARD]: 200,
      [Item.STONE]: 120,
      [Item.BRICK]: 120,
    },
  },
  "Mining station": {
    description: "Increases the efficiency of the miners",
    requirements: {
      [Item.WOOD]: 200,
      [Item.STONE]: 120,
    },
  },
  Store: {
    description: "increases the general storage capacity of the refuge",
    requirements: {
      [Item.BOARD]: 200,
      [Item.STONE]: 120,
      [Item.BRICK]: 120,
    },
  },
  "hunting house": {
    description: "",
    requirements: {
      [Item.BOARD]: 300,
      [Item.BRICK]: 200,
      [Item.STONE]: 150,
    },
  },
  church: {
    description: "",
    requirements: { [Item.BOARD]: 250, [Item.BRICK]: 300, [Item.STONE]: 1000 },
  },
  school: {
    description: "",
    requirements: { [Item.BOARD]: 400, [Item.BRICK]: 500 },
  },
  weaving: {
    description: "",
    requirements: { [Item.BOARD]: 1400, [Item.BRICK]: 1200 },
  },
  furnace: {
    description: "",
    requirements: { [Item.STONE]: 1800, [Item.BRICK]: 1600 },
  },
  bar: {
    description: "",
    requirements: {
      [Item.BOARD]: 1400,
      [Item.BRICK]: 1800,
      [Item.COPPER]: 900,
    },
  },
  restaurant: {
    description: "",
    requirements: {
      [Item.BOARD]: 1200,
      [Item.BRICK]: 2000,
      [Item.COPPER]: 600,
    },
  },
  medical: {
    description: "",
    requirements: {
      [Item.BOARD]: 2000,
      [Item.BRICK]: 1500,
      [Item.METAL]: 500,
      [Item.COPPER]: 1500,
    },
  },
  workshop: {
    description: "",
    requirements: {
      [Item.BOARD]: 6500,
      [Item.BRICK]: 5000,
      [Item.METAL]: 2500,
      [Item.COPPER]: 1700,
    },
  },

  factory: {
    description: "",
    requirements: {
      [Item.BOARD]: 4000,
      [Item.BRICK]: 3000,
      [Item.METAL]: 6000,
      [Item.COPPER]: 5000,
    },
  },
  barracks: {
    description: "",
    requirements: {
      [Item.BOARD]: 1400,
      [Item.BRICK]: 1500,
      [Item.METAL]: 3000,
      [Item.COPPER]: 1500,
    },
  },
  armory: {
    description: "",
    requirements: {
      [Item.BOARD]: 3000,
      [Item.BRICK]: 3000,
      [Item.METAL]: 3000,
      [Item.COPPER]: 3000,
    },
  }, //leatherworker
};

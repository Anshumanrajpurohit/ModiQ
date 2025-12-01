export type CategoryId =
  | "hinges"
  | "telescopic-channels"
  | "kitchen-accessories"
  | "slim-box"
  | "aluminium-series";

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
  heroLine: string;
  image: string;
};

export const categories: Category[] = [
  {
    id: "hinges",
    name: "Precision Hinges",
    heroLine: "European-grade hinges for smooth, silent cabinetry.",
    description:
      "Fully adjustable auto hinges engineered for long-term alignment, anti-corrosion protection, and effortless installation.",
    image: "/images/soft-close-side-hinge.png",
  },
  {
    id: "telescopic-channels",
    name: "Telescopic Channels",
    heroLine: "Feather-light glide with extreme load bearing.",
    description:
      "Full extension channels with synchronized travel, soft close damping, and high-cycle endurance for premium drawers.",
    image: "/images/soft-close-Tchannel.png",
  },
  {
    id: "kitchen-accessories",
    name: "Kitchen Accessories",
    heroLine: "Smart organizers that unlock every inch of storage.",
    description:
      "Ergonomic pull-outs, corner solutions, and modular inserts coated for scratch resistance and daily durability.",
    image: "/images/kitchen-accessories.png",
  },
  {
    id: "slim-box",
    name: "Slim Box Systems",
    heroLine: "Ultra-thin drawer systems with luxury motion.",
    description:
      "Double-walled drawers with minimalist aesthetics, tool-free assembly, and impeccable stability under load.",
    image: "/images/slim-box-long.png",
  },
  {
    id: "aluminium-series",
    name: "Aluminium Series",
    heroLine: "Architectural aluminium for premium builds.",
    description:
      "Profiles, shutters, and framed solutions in anodized finishes built for humid, coastal, and heavy-use environments.",
    image: "/images/alluminiumm-gseries-asseccories.png",
  },
];

export const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]));

export const getCategoryById = (id: string) => categoryMap[id as CategoryId];

import type { CategoryId } from "./categories";

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  specs: string[];
  sizes: string[];
  image: string;
  description: string;
  highlights: string[];
};

export const products: Product[] = [
  {
    id: "mod-01-0",
    name: "Regular Auto Hinge 0 Crank",
    category: "hinges",
    price: 100,
    specs: ["16mm arm screw", "35mm cup diameter", "11.5mm cup depth"],
    sizes: ["0 crank"],
    image: "/images/regular-auto-hinge.png",
    description:
      "Sturdy overlay hinge with cam adjustment for rapid onsite alignment and nickel-plated anti-rust protection.",
    highlights: ["105° opening", "Soft-close piston", "Tested 50,000 cycles"],
  },
  {
    id: "mod-01-8",
    name: "Half Overlay Hinge 8 Crank",
    category: "hinges",
    price: 125,
    specs: ["Clip-on design", "Reinforced cup base", "3-way adjustment"],
    sizes: ["8 crank"],
    image: "/images/soft-close-side-hinge.png",
    description:
      "Premium clip-on hinge for shared partitions delivering silent close action and rock-solid positioning.",
    highlights: ["Hydraulic damping", "Tool-free clip", "Rust-proof screws"],
  },
  {
    id: "mod-02-45",
    name: "45mm Heavy Telescopic Channel",
    category: "telescopic-channels",
    price: 210,
    specs: ["Full extension", "Ball bearing runner", "1.5mm thick steel"],
    sizes: ["350mm", "400mm", "450mm", "500mm"],
    image: "/images/s-s-Tchannel.png",
    description:
      "Reinforced channels with synchronized travel and powder-coated finish ideal for wardrobes and pantry pull-outs.",
    highlights: ["45kg load", "Smooth glide", "Detachable inner slide"],
  },
  {
    id: "mod-02-sc",
    name: "Soft Close Slim Channel",
    category: "telescopic-channels",
    price: 265,
    specs: ["Soft close", "Full extension", "Slim 37mm profile"],
    sizes: ["400mm", "450mm", "500mm"],
    image: "/images/soft-close-Tchannel.png",
    description:
      "Slimline damped channels engineered for premium furniture with anti-rebound closing and zero wobble.",
    highlights: ["Silent motion", "Quick release lever", "Electro zinc plated"],
  },
  {
    id: "mod-03-lp",
    name: "Corner Carousel Organizer",
    category: "kitchen-accessories",
    price: 480,
    specs: ["Anti-slip trays", "Load 30kg", "Hydraulic pivot"],
    sizes: ["800mm", "900mm"],
    image: "/images/kitchen-accessories.png",
    description:
      "Dual-tray carousel maximizing blind corner cabinets with effortless swivel action and premium coated trays.",
    highlights: ["Soft-stop motion", "Tool-free removal", "Food-safe coating"],
  },
  {
    id: "mod-03-sp",
    name: "Spice Pull-out 150",
    category: "kitchen-accessories",
    price: 320,
    specs: ["Dual chrome baskets", "Soft-close", "Stabilized runners"],
    sizes: ["150mm width"],
    image: "/images/pvc-anti-skit-mat.png",
    description:
      "Slim spice organizer with adjustable dividers keeping condiments upright even in high-traffic kitchens.",
    highlights: ["Anti-tip frame", "Anti-rust chrome", "Quick hang brackets"],
  },
  {
    id: "mod-04-st",
    name: "Slim Box Tall Drawer",
    category: "slim-box",
    price: 690,
    specs: ["Double walled", "45kg load", "Soft-close"],
    sizes: ["500mm", "550mm", "600mm"],
    image: "/images/slim-box-long.png",
    description:
      "Tall pantry drawer kit with graphite walls, synchronized runners, and effortless cam adjustments.",
    highlights: ["Glass side option", "Integrated rail cap", "Feather touch"],
  },
  {
    id: "mod-04-md",
    name: "Slim Box Mid Drawer",
    category: "slim-box",
    price: 540,
    specs: ["Metal sides", "3D adjustment", "Soft-close"],
    sizes: ["450mm", "500mm", "550mm"],
    image: "/images/slim-box-mid.png",
    description:
      "Low profile drawer solution with pin-straight lines perfect for cutlery, accessories, and daily storage.",
    highlights: ["15mm thickness", "Quick locking front", "Matte graphite"],
  },
  {
    id: "mod-05-ap",
    name: "Aluminium Profile Handle",
    category: "aluminium-series",
    price: 180,
    specs: ["6063 alloy", "Anodized", "Grip friendly"],
    sizes: ["8ft", "10ft"],
    image: "/images/alluminum-cgola-pofile.png",
    description:
      "Slim edge profile adding a flush, modern accent with superior grip comfort and scuff resistance.",
    highlights: ["Champagne finish", "Finger-proof", "Easy mitre"],
  },
  {
    id: "mod-05-fr",
    name: "Aluminium Glass Frame",
    category: "aluminium-series",
    price: 360,
    specs: ["Soft-close buffer", "Integrated gasket", "Custom heights"],
    sizes: ["600mm x 2100mm", "Custom"],
    image: "/images/alluminum-slim-track.png",
    description:
      "Pre-engineered frame kit for glass shutters featuring seamless corners and superior corrosion resistance.",
    highlights: ["Level adjusters", "Matte black option", "Ready-to-assemble"],
  },
];

export const getProductsByCategory = (category: string) =>
  products.filter((product) => product.category === category);

export const getProductById = (id: string) =>
  products.find((product) => product.id === id);

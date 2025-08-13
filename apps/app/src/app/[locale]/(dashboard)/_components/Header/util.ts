import { Bolt } from "lucide-react";
import { CircleHelp } from "lucide-react";
import { Lock } from "lucide-react";
import { ShieldPlus } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { PanelsTopLeft } from "lucide-react";
import { Dessert } from "lucide-react";

export const Menus = [
  {
    name: "Home",
    url: "/",
    icon: PanelsTopLeft,
  },
  {
    name: "Features",
    subMenuHeading: ["QR Tools"],
    subMenu: [
      {
        name: "QR",
        desc: "Generate QR codes",
        icon: Bolt,
        url: "/qr",
      },
      {
        name: "Scan QR",
        desc: "Scan QR codes",
        icon: MessageCircle,
        url: "/scanqr",
      },
    ],
    gridCols: 2,
  },
  {
    name: "Settings",
    subMenuHeading: ["Account Settings"],
    subMenu: [
      {
        name: "General",
        desc: "Manage settings",
        icon: CircleHelp,
        url: "/settings",
      },
      {
        name: "Billing",
        desc: "Billing details",
        icon: Lock,
        url: "/settings/billing",
      },
    ],
    gridCols: 2,
  },
  {
    name: "Account",
    subMenuHeading: ["Plan & Benefits"],
    subMenu: [
      {
        name: "Subscriptions",
        desc: "Manage plans",
        icon: ShieldPlus,
        url: "/subscriptions",
      },
      {
        name: "Rewards",
        desc: "View rewards",
        icon: Dessert,
        url: "/rewards",
      },
    ],
    gridCols: 2,
  },
];
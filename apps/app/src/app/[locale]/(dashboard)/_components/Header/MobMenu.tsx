"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, ChevronDown, LucideProps } from "lucide-react";
import Link from "next/link";

// Menus data with corrected URL for "QR"


type SubMenuItem = {
  name: string;
  desc?: string;
  icon?: React.ComponentType<LucideProps>;
  url?: string;
};

type MenuItem = {
  name: string;
  url?: string;
  icon?: React.ComponentType<LucideProps>;
  gridCols?: number;
  subMenu?: SubMenuItem[];
  subMenuHeading?: string[];
};

interface MobMenuProps {
  Menus: MenuItem[];
}

export default function MobMenu({ Menus }: MobMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clicked, setClicked] = useState<number | null>(null);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
    setClicked(null);
  };

  const subMenuDrawer = {
    enter: { height: "auto", overflow: "hidden" },
    exit: { height: 0, overflow: "hidden" },
  };

  return (
    <div>
      <button className="lg:hidden z-[999] relative" onClick={toggleDrawer}>
        {isOpen ? <X /> : <Menu />}
      </button>

      <motion.div
        className="fixed left-0 right-0 top-16 overflow-y-auto h-full bg-[#18181A] backdrop-blur text-white p-6 pb-20"
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
      >
        <ul>
          {Menus.map(({ name, url, icon: Icon, subMenu }, i) => {
            const isClicked = clicked === i;
            const hasSubMenu = !!subMenu?.length;
            return (
              <li key={name}>
                <span
                  className="flex justify-between items-center p-4 hover:bg-white/5 rounded-md cursor-pointer"
                  onClick={() => (hasSubMenu ? setClicked(isClicked ? null : i) : null)}
                >
                  {url ? (
                    <Link href={url} className="flex-1 flex items-center gap-x-2">
                      {Icon && <Icon size={17} />}
                      {name}
                    </Link>
                  ) : (
                    <span className="flex-1 flex items-center gap-x-2">
                      {Icon && <Icon size={17} />}
                      {name}
                    </span>
                  )}
                  {hasSubMenu && (
                    <ChevronDown
                      className={`ml-auto transition-transform ${
                        isClicked ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </span>

                {hasSubMenu && (
                  <motion.ul
                    initial="exit"
                    animate={isClicked ? "enter" : "exit"}
                    variants={subMenuDrawer}
                    className="ml-5"
                  >
                    {subMenu?.map(({ name, icon: SubMenuIcon, url }) => (
                      <li
                        key={name}
                        className="p-2 flex items-center hover:bg-white/5 rounded-md gap-x-2 cursor-pointer"
                      >
                        {url ? (
                          <Link href={url} className="flex items-center gap-x-2">
                            {SubMenuIcon && <SubMenuIcon size={17} />}
                            {name}
                          </Link>
                        ) : (
                          <>
                            {SubMenuIcon && <SubMenuIcon size={17} />}
                            {name}
                          </>
                        )}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
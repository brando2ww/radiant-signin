import { NavLink as RouterNavLink, type NavLinkProps as RouterNavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends RouterNavLinkProps {
  activeClassName?: string;
}

export function NavLink({ className, activeClassName, ...props }: NavLinkProps) {
  return (
    <RouterNavLink
      className={({ isActive }) =>
        cn(typeof className === "string" ? className : "", isActive && activeClassName)
      }
      {...props}
    />
  );
}

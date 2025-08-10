import { buttonVariants } from '@v1/ui/button'
import { cn } from '@v1/ui/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

  
const TabBar = () => {
  const pathname = usePathname();
const isDashboardPath = pathname === "/";
  const isSettingsPath = pathname === "/settings";
  const isBillingPath = pathname === "/settings/billing";
  const isUserPath = pathname === "/user";

  return (
    <div className="mx-auto flex w-full max-w-screen-xl items-center gap-3">
        <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isDashboardPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            href="/"
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Dashboard
          </Link>
        </div>
        <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isSettingsPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            href="/settings"
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Settings
          </Link>
        </div>
         <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isUserPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            href="/user"
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            User
          </Link>
        </div>
          <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isUserPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            href="/scanqr"
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            QrScaner
          </Link>
        </div>
              <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isUserPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            href="/subscriptions"
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Subscriptions
          </Link>
        </div>
          <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isUserPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            href="/qr"
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
           Qr
          </Link>
        </div>
         <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isUserPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            href="/reward"
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Rewards
          </Link>
        </div>
        <div
          className={cn(
            "flex h-12 items-center border-b-2",
            isBillingPath ? "border-primary" : "border-transparent",
          )}
        >
          <Link
            href="/settings/billing"
            className={cn(
              `${buttonVariants({ variant: "ghost", size: "sm" })} text-primary/80`,
            )}
          >
            Billing
          </Link>
        </div>
      </div>
  )
}

export default TabBar

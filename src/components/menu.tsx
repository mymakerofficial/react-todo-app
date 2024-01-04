import {LucideIcon, MoreHorizontal} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuPortal,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {forEachAs, isNotLast, takeIf} from "@/lib/take.ts";
import {cn} from "@/lib/utils.ts";
import {ReactNode} from "react";

export interface MenuItem {
  key?: string
  label: string
  icon?: LucideIcon
  onClick?: () => void
  className?: string
  disabled?: boolean
  subMenu?: MenuItems
}

export type MenuItems = Array<Array<MenuItem>>

function getIcon(icon: LucideIcon | undefined): ReactNode {
  if (!icon) {
    return <></>
  }

  const Icon = icon

  return <Icon className='size-[1rem]'/>
}

function menuContent(itemGroups: MenuItems) {
  return itemGroups.flatMap((items, index) => (
    <>
      <DropdownMenuGroup>
        {...forEachAs(items, menuItem)}
      </DropdownMenuGroup>
      {takeIf(isNotLast(index, itemGroups),
        <DropdownMenuSeparator key={index} />
      )}
    </>
  ))
}

function subMenu(menuItem: MenuItem) {
  if (!menuItem.subMenu) {
    return null
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className={cn('space-x-2', menuItem.className)} disabled={menuItem.disabled} key={menuItem.key || menuItem.label}>
        { getIcon(menuItem.icon) }
        <span>{ menuItem.label }</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          { menuContent(menuItem.subMenu) }
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}

function menuItem(menuItem: MenuItem) {
  if (menuItem.subMenu) {
    return subMenu(menuItem)
  }

  return (
    <DropdownMenuItem onClick={menuItem.onClick} className={cn('space-x-2', menuItem.className)} disabled={menuItem.disabled} key={menuItem.key || menuItem.label} >
      { getIcon(menuItem.icon) }
      <span>{menuItem.label}</span>
    </DropdownMenuItem>
  )
}

export function Menu({icon, items: itemGroups}: {icon?: LucideIcon, items: MenuItems}) {
  const Icon = icon ?? MoreHorizontal

  const menuElements = menuContent(itemGroups)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon'>
          <Icon className='size-[1.2rem]' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        { menuElements }
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
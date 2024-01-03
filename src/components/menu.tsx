import {LucideIcon, MoreHorizontal} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {forEachAs, isNotLast, takeIf} from "@/lib/take.ts";
import {cn} from "@/lib/utils.ts";

export interface MenuItem {
  label: string
  icon: LucideIcon
  onClick: () => void
  className?: string
}

export type MenuItems = Array<Array<MenuItem>>

function menuItem(menuItem: MenuItem) {
  const {label, icon: Icon, onClick, className} = menuItem

  return (
    <DropdownMenuItem onClick={onClick} className={cn('space-x-2', className)} key={label} >
      <Icon className='size-[1rem]'/>
      <span>{label}</span>
    </DropdownMenuItem>
  )
}

export function Menu({icon, items: itemGroups}: {icon?: LucideIcon, items: MenuItems}) {
  const Icon = icon ?? MoreHorizontal

  const menuElements = itemGroups.flatMap((items, index) => [
    ...forEachAs(items, menuItem),
    takeIf(isNotLast(index, itemGroups),
      <DropdownMenuSeparator key={index} />
    ),
  ])

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
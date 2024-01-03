import {LucideIcon, MoreHorizontal} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {twMerge} from "tailwind-merge";

export interface MenuItem {
  label: string
  icon: LucideIcon
  onClick: () => void
  className?: string
}

export type MenuItems = Array<Array<MenuItem>>

function menuItem(menuItem: MenuItem) {
  const {label, icon: Icon, onClick, className} = menuItem

  const combinedClassName = twMerge('space-x-2', className)

  return (
    <DropdownMenuItem onClick={onClick} className={combinedClassName} key={label} >
      <Icon className='size-[1rem]'/>
      <span>{label}</span>
    </DropdownMenuItem>
  )
}

export function Menu({icon, itemGroups}: {icon?: LucideIcon, itemGroups: MenuItems}) {
  const Icon = icon ?? MoreHorizontal

  const menuElements = itemGroups.flatMap((items, index) => [
    ...items.map((item) => menuItem(item)),
    index !== items.length && itemGroups.length > 1 ? <DropdownMenuSeparator key={index} /> : null,
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
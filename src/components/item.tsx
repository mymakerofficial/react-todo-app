import {TodoItem} from "@/lib/item.ts";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Pencil, Save,
  Trash2
} from "lucide-react";
import {CheckedState} from "@radix-ui/react-checkbox";
import {ListState} from "@/lib/use-list.ts";
import {Menu, MenuItems} from "@/components/menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {useState} from "react";
import {cn} from "@/lib/utils.ts";
import {takeIf} from "@/lib/take.ts";

interface ItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  showTrigger: boolean
  item: TodoItem
  onUpdateItem: (changes: Partial<TodoItem>) => void
  onRemoveItem: () => void
}

function ItemDialog({ open, onOpenChange: setOpen, showTrigger, item, onUpdateItem, onRemoveItem }: ItemDialogProps) {
  const dialogFormSchema = z.object({
    label: z.string({
      required_error: "Label is required",
    })
      .min(1, "Label must be at least 1 character long")
      .max(100, "Label must be at most 100 characters long"),
    description: z.string()
      .max(1000, "Description must be at most 1000 characters long")
      .optional()
  })

  const form = useForm<z.infer<typeof dialogFormSchema>>({
    resolver: zodResolver(dialogFormSchema),
    defaultValues: {
      ...item,
    }
  })

  function handleSubmit(data: z.infer<typeof dialogFormSchema>) {
    onUpdateItem(data)
    setOpen(false)
  }

  function handleRemove() {
    onRemoveItem()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {takeIf(showTrigger,
        <DialogTrigger>
          <Button variant='ghost' size='icon'>
            <Pencil className='size-[1.2rem]' />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField control={form.control} name='label' render={({field}) => (
                <FormItem className="grid grid-cols-4 gap-4">
                  <FormLabel className='text-right mt-5'>Title</FormLabel>
                  <FormControl>
                    <Input className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name='description' render={({field}) => (
                <FormItem className="grid grid-cols-4 gap-4">
                  <FormLabel className='text-right mt-5'>Description</FormLabel>
                  <FormControl>
                    <Textarea className='col-span-3' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter>
              <Button onClick={handleRemove} variant='secondary' className='space-x-2 text-red-500 bg-red-100/60 hover:bg-red-100/90 dark:bg-red-950/60 dark:hover:bg-red-950/80'>
                <span>Delete</span>
                <Trash2 className='size-[1.1rem]'/>
              </Button>
              <Button type='submit' variant='default' className='space-x-2'>
                <span>Save changes</span>
                <Save className='size-[1.1rem]'/>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

interface ItemProps {
  item: TodoItem
  onUpdateItem: ListState<TodoItem>['update']
  onMoveItem: ListState<TodoItem>['move']
  onMoveItemRelative: ListState<TodoItem>['moveRelative']
  onRemoveItem: ListState<TodoItem>['remove']
}

export function Item({item, onUpdateItem, onMoveItem, onMoveItemRelative, onRemoveItem}: ItemProps) {
  const [hovering, setHovering] = useState(false)
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  const handleUpdate = (changes: Partial<TodoItem>) => onUpdateItem(item.id, changes)
  const handleCheckedChange = (checkedState: CheckedState) => handleUpdate({completed: checkedState === true})
  const handleMoveUp = () => onMoveItemRelative(item.id, -1)
  const handleMoveDown = () => onMoveItemRelative(item.id, 1)
  const handleMoveToTop = () => onMoveItem(item.id, 0)
  const handleMoveToBottom = () => onMoveItem(item.id, Infinity)
  const handleRemove = () => onRemoveItem(item.id)

  const handleOpenDialog = () => setDialogIsOpen(true)

  const menuItems: MenuItems = [[
    {label: 'Delete', icon: Trash2, onClick: handleRemove, className: 'text-red-500' }
  ], [
    {label: 'Edit', icon: Pencil, onClick: handleOpenDialog }
  ], [
    { label: 'Move up', icon: ChevronUp, onClick: handleMoveUp },
    { label: 'Move down', icon: ChevronDown, onClick: handleMoveDown }
  ], [
    { label: 'Move to top', icon: ChevronsUp, onClick: handleMoveToTop },
    { label: 'Move to bottom', icon: ChevronsDown, onClick: handleMoveToBottom }
  ]]

  const hasLabel = item.label.length > 0
  const hasDescription = item.description.length > 0

  return (
    <article className='grid grid-cols-4 gap-4 items-center p-4 max-w-full' onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
      <label htmlFor={`item-${item.id}`} className='col-span-3 flex flex-row gap-4 items-center flex-grow max-w-full'>
        <Checkbox id={`item-${item.id}`} checked={item.completed} onCheckedChange={handleCheckedChange}/>
        {takeIf(hasLabel,
          <h3 className={cn('font-medium', takeIf(item.completed, 'line-through'))}>{item.label}</h3>
        )}
        {takeIf(hasDescription,
          <p className={cn('text-sm text-muted-foreground truncate', takeIf(item.completed, 'line-through'))}>{item.description}</p>
        )}
      </label>
      <div className='col-span-1 text-right space-x-2'>
        <ItemDialog
          open={dialogIsOpen}
          onOpenChange={setDialogIsOpen}
          showTrigger={hovering}
          item={item}
          onUpdateItem={handleUpdate}
          onRemoveItem={handleRemove}
        />
        <Menu itemGroups={menuItems} />
      </div>
    </article>
  )
}
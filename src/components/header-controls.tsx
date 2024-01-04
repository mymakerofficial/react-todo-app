import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {CheckCircle, Plus, Redo, Trash2, Undo} from "lucide-react";
import {Menu, MenuItems} from "@/components/menu.tsx";
import {ListState} from "@/lib/use-list.ts";
import {TodoItem} from "@/lib/item.ts";
import {ifNot} from "@/lib/take.ts";

const formSchema = z.object({
  label: z.string({
    required_error: "Label is required",
  })
    .min(1, "Label must be at least 1 character long")
    .max(100, "Label must be at most 100 characters long")
})

interface HeaderControlsProps {
  canUndo: boolean
  canRedo: boolean
  onAddItem: (partialItem: Partial<TodoItem>) => void
  onUndo: () => void
  onRedo: () => void
  onDeleteAll: ListState<TodoItem>['clear']
  onCompleteAll: () => void
}

export function HeaderControls({canUndo, canRedo, onAddItem, onUndo, onRedo, onDeleteAll, onCompleteAll}: HeaderControlsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
    }
  })

  function handleSubmit(data: z.infer<typeof formSchema>) {
    onAddItem({ label: data.label })
    form.reset()
  }

  function handleUndo() {
    onUndo()
  }

  function handleRedo() {
    onRedo()
  }

  function handleDeleteAll() {
    onDeleteAll()
  }

  function handleCompleteAll() {
    onCompleteAll()
  }

  const menuItems: MenuItems = [[
    { label: 'Undo',  icon: Undo,  onClick: handleUndo, disabled: ifNot(canUndo)},
    { label: 'Redo',  icon: Redo,  onClick: handleRedo, disabled: ifNot(canRedo)},
  ], [
    { label: 'Delete all tasks',  icon: Trash2,  onClick: handleDeleteAll,  className: 'text-red-500'},
    { label: 'Mark all completed',  icon: CheckCircle, onClick: handleCompleteAll},
  ]]

  return (
    <div className='flex space-x-2 pl-2 pr-4'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='flex-grow flex space-x-2'>
          <FormField control={form.control} name='label' render={({field}) => (
            <FormItem className='flex-grow'>
              <FormControl>
                <Input placeholder='What do you want to do?...' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button variant='ghost' size='icon' type='submit'><Plus className='size-[1.2rem]' /></Button>
        </form>
      </Form>
      <Menu items={menuItems} />
    </div>
  )
}
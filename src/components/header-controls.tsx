import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Check, CheckCircle, Plus, Trash2} from "lucide-react";
import {Menu, MenuItems} from "@/components/menu.tsx";
import {ListState} from "@/lib/use-list.ts";
import {TodoItem} from "@/lib/item.ts";

const formSchema = z.object({
  label: z.string({
    required_error: "Label is required",
  })
    .min(1, "Label must be at least 1 character long")
    .max(100, "Label must be at most 100 characters long")
})

interface HeaderControlsProps {
  onAddItem: (partialItem: Partial<TodoItem>) => void
  onDeleteAll: ListState<TodoItem>['clear']
  onCompleteAll: () => void
}

export function HeaderControls({onAddItem, onDeleteAll, onCompleteAll}: HeaderControlsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: '',
    }
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    onAddItem({ label: data.label })
    form.reset()
  }

  function handleDeleteAll() {
    onDeleteAll()
  }

  function handleCompleteAll() {
    onCompleteAll()
  }

  const menuItems: MenuItems = [[
    { label: 'Delete all tasks',  icon: Trash2,  onClick: handleDeleteAll,  className: 'text-red-500'},
    { label: 'Mark all completed',  icon: CheckCircle, onClick: handleCompleteAll},
  ]]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='flex space-x-2 pl-2 pr-4'>
        <FormField control={form.control} name='label' render={({field}) => (
          <FormItem className='flex-grow'>
            <FormControl>
              <Input placeholder='What do you want to do?...' {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button variant='ghost' size='icon' type='submit'><Plus className='size-[1.2rem]' /></Button>
        <Menu items={menuItems} />
      </form>
    </Form>
  )
}
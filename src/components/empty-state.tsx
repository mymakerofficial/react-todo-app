import Balancer from "react-wrap-balancer";

export function EmptyState({label, text, icon}: {label: string, text: string, icon: string}) {
  return (
    <div className='flex flex-col items-center justify-center gap-8 py-12'>
      <span className='text-5xl'>{icon}</span>
      <h2 className='text-xl font-bold'>{label}</h2>
      <p className='text-gray-500'><Balancer ratio={1} preferNative={false}>{text}</Balancer></p>
    </div>
  )
}
import InventoryItemManager from '@/app/components/admin/InventoryItemManager'

async function Page({params}){
    console.log(params)
    const inventoryId = await params.id
  return (
    <div>
        <InventoryItemManager inventoryId={inventoryId}/>
    </div>
  )
}

export default Page;

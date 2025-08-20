
import dynamic from "next/dynamic";


export default function CarTrackingPage() {

  const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });

  return(

    <div className=" bg-gray-50">
      <div>
        <MapView />
      </div>
    </div>

  )
 

}


import dynamic from "next/dynamic";
import NavBar from "../../../components/NavBar";


export default function CarTrackingPage() {

  const MapView = dynamic(() => import("../../../components/MapView"), { ssr: false });
  const tabs = [
    { label: "실시간 차량 현황", href: "/car-tracking" },
    { label: "전체 운행 현황", href: "/car-tracking/multi-car" },
  ];
  return(

    <div className=" bg-gray-50">
      <NavBar tabs={tabs} />
      <div className="w-50%">
        <MapView />
      </div>
    </div>

  )
 

}

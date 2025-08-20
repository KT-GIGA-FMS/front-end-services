// app/car/page.js
import { redirect } from "next/navigation";

export default function CarIndexPage() {
  redirect("/car/cars");
}

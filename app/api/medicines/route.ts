import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    let medicines = await prisma.medicine.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });

    // Auto-seed sample inventory instantly if empty
    if (medicines.length === 0) {
      let sampleMeds = [];

      if (storeId.includes("homeopathy")) {
        sampleMeds = [
          { name: "Arsenicum Album 30C", category: "Homeopathic Remedy", stock: 150, price: 120.00, expiryDate: new Date("2029-12-31"), storeId },
          { name: "Arnica Montana 200CH", category: "Homeopathic Remedy", stock: 200, price: 145.00, expiryDate: new Date("2029-10-15"), storeId },
          { name: "Nux Vomica 30C", category: "Digestive Care", stock: 110, price: 135.00, expiryDate: new Date("2028-08-20"), storeId },
          { name: "Rhus Toxicodendron 30C", category: "Joint & Muscle", stock: 85, price: 125.00, expiryDate: new Date("2029-05-10"), storeId },
        ];
      } else if (storeId.includes("clinic")) {
        sampleMeds = [
          { name: "Paracetamol 500mg", category: "Analgesic", stock: 250, price: 18.00, expiryDate: new Date("2028-12-31"), storeId },
          { name: "Cetirizine 10mg", category: "Antihistamine", stock: 180, price: 12.00, expiryDate: new Date("2028-09-30"), storeId },
          { name: "ORS Electrolyte Packets", category: "Hydration", stock: 300, price: 22.00, expiryDate: new Date("2029-06-30"), storeId },
          { name: "Pantoprazole 40mg", category: "Gastrointestinal", stock: 90, price: 45.00, expiryDate: new Date("2028-05-12"), storeId },
        ];
      } else {
        sampleMeds = [
          { name: "Paracetamol 650mg", category: "Analgesic", stock: 850, price: 22.50, expiryDate: new Date("2028-12-31"), storeId },
          { name: "Amoxicillin 500mg", category: "Antibiotic", stock: 45, price: 95.00, expiryDate: new Date("2027-06-15"), storeId },
          { name: "Cetirizine 10mg", category: "Antihistamine", stock: 620, price: 15.00, expiryDate: new Date("2028-09-30"), storeId },
          { name: "Omeprazole 20mg", category: "Gastrointestinal", stock: 210, price: 45.00, expiryDate: new Date("2027-03-20"), storeId },
          { name: "Ibuprofen 400mg", category: "Anti-inflammatory", stock: 380, price: 28.00, expiryDate: new Date("2029-01-10"), storeId },
        ];
      }

      for (const med of sampleMeds) {
        await prisma.medicine.create({ data: med });
      }

      medicines = await prisma.medicine.findMany({
        where: { storeId },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json(medicines);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}
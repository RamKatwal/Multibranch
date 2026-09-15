import type { ProductCategory } from "@/types/product-category"

export const mockProductCategories: ProductCategory[] = [
  {
    id: "PRC1",
    name: "Mobile",
    parentId: null,
    parentName: null,
    isSubCategory: false,
    entryBy: "ram",
    status: "active",
  },
  {
    id: "PRC2",
    name: "Laptop",
    parentId: null,
    parentName: null,
    isSubCategory: false,
    entryBy: "admin",
    status: "active",
  },
  {
    id: "PRC3",
    name: "Accessories",
    parentId: null,
    parentName: null,
    isSubCategory: false,
    entryBy: "gopal",
    status: "active",
  },
  {
    id: "PRC4",
    name: "Smartphones",
    parentId: "PRC1",
    parentName: "Mobile",
    isSubCategory: true,
    entryBy: "ram",
    status: "active",
  },
  {
    id: "PRC5",
    name: "Appliances",
    parentId: null,
    parentName: null,
    isSubCategory: false,
    entryBy: "farah",
    status: "inactive",
  },
]

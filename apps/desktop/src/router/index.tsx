import {
  Routes,
  Route
} from "react-router-dom";


import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Categories from "../pages/Categories";
import Log from "../pages/Log";
import Layout from "../components/Layout";
import ProtectedRoute from "./ProtectedRoute";
import ProductDetail from "../pages/ProductDetail";
import Registration from "../pages/Registration";
import Owner from "../pages/Owner";
import Inventory from "../pages/Inventory";
import Export from "../pages/Export";
import Warehouse from "../pages/Warehouse";
import BrockenWhatching from "../pages/BrockenWatching";
import Information from "../pages/Infomation";
import ChildAccounts from "../pages/ChildAccounts";
import WeaponSearch from "../pages/WeaponSearch";
import Ammunition from "../pages/Ammunition";



export default function Router(){

return (

  <Routes>

    <Route path="/" element={<Login />} />

    <Route element={<ProtectedRoute />}>

      <Route element={<Layout />}>

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/products" element={<Products />} />

        <Route path="/categories" element={<Categories />} />

        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/registrations" element={<Registration />} />

        <Route path="/owners" element={<Owner />} />

        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/ammunition" element={<Ammunition />} />
        <Route path="/exports" element={<Export />} />
        <Route path="/exports/ammunition" element={<Export />} />
        <Route path="/warehouses" element={<Warehouse />} />
        <Route path="/logs" element={<Log />} />
        <Route path="/broken-watching" element={<BrockenWhatching />} />
        <Route path="/about" element={<Information />} />
        <Route path="/child-accounts" element={<ChildAccounts />} />
        <Route path="/weapon-search" element={<WeaponSearch />} />

      </Route>

    </Route>

  </Routes>

)

}
import React from "react";
import {
  FaHome,
  FaBox,
  FaUser,
  FaFileInvoice,
} from "react-icons/fa";
import { GiCash } from "react-icons/gi";
import {
  MdAccountBalanceWallet,
  MdFactory,
  MdOutlinePayments,
  MdOutlinePointOfSale,
  MdOutlineReport,
  MdOutlineInventory,
  MdLockOutline,
  MdSettings,
} from "react-icons/md";
import SideMenu from "./SideMenu";
import { GrTransaction } from "react-icons/gr";
import { BiEdit } from "react-icons/bi";
import { pathTo } from "../../utils/appMode";

const AdminSideMenu = () => {
  const sideMenuItems = [
    { title: "Main Dashboard", icon: <FaHome />, link: pathTo() },
    { title: "Counter Sale", icon: <MdOutlinePointOfSale />, link: pathTo("counter-sale") },
    { title: "Edit Counter Sale", icon: <BiEdit />, link: pathTo("edit-counter-sale") },
    { title: "Suppliers", icon: <MdFactory />, link: pathTo("suppliers") },
    { title: "Items", icon: <FaBox />, link: pathTo("items") },
    { title: "Customers", icon: <FaUser />, link: pathTo("customers") },
    { title: "Ledgers", icon: <GrTransaction />, link: pathTo("ledgers") },
    { title: "Add Stock / Invoices", icon: <FaFileInvoice />, link: pathTo("invoices") },
    { title: "Payment", icon: <GiCash />, link: pathTo("payments") },
    { title: "Stocks Stats", icon: <MdOutlineInventory />, link: pathTo("stocks-stats") },
    { title: "Expense", icon: <MdOutlinePayments />, link: pathTo("expense") },
    { title: "Accounts", icon: <MdAccountBalanceWallet />, link: pathTo("accounts") },
    { title: "Reports", icon: <MdOutlineReport />, link: pathTo("report") },
    { title: "Fixed Assets", icon: <MdOutlineInventory />, link: pathTo("fixed-assets") },
    { title: "App Config", icon: <MdSettings />, link: pathTo("config") },
    { title: "Change Password", icon: <MdLockOutline />, link: pathTo("change-password") },
  ];

  return <SideMenu sideMenuItems={sideMenuItems} />;
};

export default AdminSideMenu;

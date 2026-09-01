import { BiEdit } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { FiEye, FiBookOpen } from "react-icons/fi";

export function buildRowActions({
  column,
  Data,
  rowIndex,
  handlers,
  basePath,
}) {
  const {
    setSelected,
    setOpenEditModal,
    setOpenDeleteModal,
    navigate,
    setLoading,
    Loading,
    AllRows,
    setRows,
    SelectedCustomer,
    dispatch,
    DeleteItemInvoiceApi,
    SuccessToast,
    fetchCustomerInvoice,
    fetchCustomerReturnInvoice,
    fetchCustomers,
    fetchItems,
  } = handlers;

  const actions = [];

  if (column.id === "payments") {
    actions.push({
      label: "View Payments",
      icon: FiEye,
      onClick: () => {
        if (column.type === "Customer")
          navigate(`${basePath}/customers-payments/${Data._id}`);
        else navigate(`${basePath}/supplier-payments/${Data._id}`);
      },
    });
    return actions;
  }

  if (column.id === "customer_payment_actions") {
    actions.push({
      label: "Delete",
      icon: RiDeleteBin5Line,
      danger: true,
      onClick: () => {
        setSelected(Data);
        setOpenDeleteModal(true);
      },
    });
    return actions;
  }

  if (column.id === "actions") {
    if (column.type === "customer" || column.type === "supplier") {
      actions.push({
        label: "Open Ledger",
        icon: FiBookOpen,
        onClick: () => {
          navigate(`${basePath}/ledgers`, {
            state: {
              ledgerType: column.type,
              party: Data,
            },
          });
        },
      });
    }
    actions.push({
      label: "Edit",
      icon: BiEdit,
      onClick: () => {
        if (column.type === "mcqs") {
          navigate("/admin/mcqs/edit/" + Data._id);
        } else {
          setSelected(Data);
          setOpenEditModal(true);
        }
      },
    });
    actions.push({
      label: "Delete",
      icon: RiDeleteBin5Line,
      danger: true,
      onClick: () => {
        setSelected(Data);
        setOpenDeleteModal(true);
      },
    });
    return actions;
  }

  if (column.id === "company_invoice_actions") {
    actions.push({
      label: "Edit",
      icon: BiEdit,
      onClick: () => {
        setSelected(Data);
        setOpenEditModal(true);
      },
    });
    actions.push({
      label: "Delete",
      icon: RiDeleteBin5Line,
      danger: true,
      onClick: () => {
        setSelected(Data);
        setOpenDeleteModal(true);
      },
    });
    return actions;
  }

  if (column.id === "invoice_actions" && column.type === "edit") {
    if (!Loading) {
      actions.push({
        label: "Delete Item",
        icon: RiDeleteBin5Line,
        danger: true,
        onClick: async () => {
          setLoading(true);
          try {
            const response = await DeleteItemInvoiceApi(Data._id);
            if (response.data.success) {
              SuccessToast("Invoice item deleted successfully");
              dispatch(
                fetchCustomerInvoice({
                  id: SelectedCustomer._id,
                  role: 3,
                })
              );
              dispatch(
                fetchCustomerReturnInvoice({
                  id: SelectedCustomer._id,
                  role: 3,
                })
              );
              dispatch(fetchCustomers());
              dispatch(fetchItems());
            }
          } catch (error) {
            console.log(error);
          }
          setLoading(false);
        },
      });
    }
    actions.push({
      label: "Edit",
      icon: BiEdit,
      onClick: () => {
        setSelected(Data);
        setOpenEditModal(true);
      },
    });
    return actions;
  }

  if (column.id === "actions_invoice_delete") {
    actions.push({
      label: "Remove",
      icon: RiDeleteBin5Line,
      danger: true,
      onClick: () => {
        const filteredData = AllRows.filter((dt, i) => rowIndex !== i);
        setRows(filteredData);
      },
    });
    return actions;
  }

  return actions;
}

export function getActionColumn(Columns) {
  return Columns.find((col) =>
    [
      "actions",
      "payments",
      "customer_payment_actions",
      "company_invoice_actions",
      "invoice_actions",
      "actions_invoice_delete",
    ].includes(col.id)
  );
}

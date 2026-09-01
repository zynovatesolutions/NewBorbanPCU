import React, { useEffect, useState } from "react";
import ModalWrapper from "./ModalWrapper";
import { DynamicForm } from "../ui";
import SupplierSelector from "../Selector/SupplierSelector";
import CustomerSelector from "../Selector/CustomerSelector";
import DepositorTypeSelector from "../Selector/DepositorTypeSelector";
import AccountSelector from "../Selector/AccountSelector";
import { useDispatch } from "react-redux";
import { fetchAccountsAmount } from "../../store/Slices/AccountSlice";
import { ErrorToast, SuccessToast } from "../../utils/ShowToast";
import { CreatePaymentApi } from "../../ApiRequests";
import { fetchCustomers } from "../../store/Slices/CustomerSlice";
import { fetchSuppliers } from "../../store/Slices/SupplierSlice";

const userData = JSON.parse(localStorage.getItem("user"));
const role = "";
const branch_Id = "";
const branch = "";

const AddNewPaymentModal = ({ open, setOpen }) => {
  const [activeTab, setActiveTab] = useState("Customer");
  const [SelectedSupplier, setSelectedSupplier] = useState("");
  const [SelectedCustomer, setSelectedCustomer] = useState("");
  const [SelectedAccount, setSelectedAccount] = useState("");
  const [Loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAccountsAmount());
  }, [dispatch]);

  useEffect(() => {
    setSelectedSupplier("");
    setSelectedCustomer("");
  }, [activeTab]);

  const fields = [
    {
      name: "partyType",
      type: "custom",
      fullWidth: true,
      render: () => (
        <DepositorTypeSelector
          selectedType={activeTab}
          setSelectedType={setActiveTab}
        />
      ),
    },
    {
      name: "party",
      type: "custom",
      fullWidth: true,
      validate: () => {
        if (activeTab === "Customer" && !SelectedCustomer?._id)
          return "Select a customer";
        if (activeTab === "Supplier" && !SelectedSupplier?._id)
          return "Select a supplier";
        return undefined;
      },
      render: () =>
        activeTab === "Customer" ? (
          <CustomerSelector
            SelectedCustomer={SelectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
          />
        ) : (
          <SupplierSelector
            SelectedSupplier={SelectedSupplier}
            setSelectedSupplier={setSelectedSupplier}
          />
        ),
    },
    {
      name: "account",
      type: "custom",
      fullWidth: true,
      validate: () =>
        !SelectedAccount?._id ? "Select an account" : undefined,
      render: () => (
        <div>
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">
            Account <span className="text-red-500">*</span>
          </span>
          <AccountSelector
            activeTab={SelectedAccount}
            setActiveTab={setSelectedAccount}
          />
        </div>
      ),
    },
    {
      name: "depositor",
      label: "Depositor",
      type: "text",
      placeholder: "Enter Depositor",
    },
    { name: "date", label: "Date", type: "date", required: true },
    {
      name: "desc",
      label: "Description",
      type: "text",
      required: true,
      placeholder: "Enter Description",
    },
    {
      name: "amount",
      label: "Amount",
      type: "number",
      required: true,
      placeholder: "Enter Amount",
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    if (
      (!SelectedCustomer && activeTab === "Customer") ||
      (!SelectedSupplier && activeTab === "Supplier") ||
      !SelectedAccount?._id
    ) {
      ErrorToast("All required fields must be filled (including Account)!");
      setLoading(false);
      return;
    }
    try {
      const payload = {
        payment_type: 2,
        branch: -1,
        branchId: null,
        accountId: SelectedAccount._id,
        bank_name: SelectedAccount.account_name,
        bank_number: SelectedAccount.account_no,
        depositor: values.depositor || "-",
        user_type: activeTab === "Customer" ? 2 : 1,
        user_name:
          activeTab === "Customer"
            ? SelectedCustomer.name
            : SelectedSupplier.name,
        user_Id:
          activeTab === "Customer"
            ? SelectedCustomer._id
            : SelectedSupplier._id,
        amount: Number(values.amount),
        date: values.date,
        desc: values.desc,
      };
      const response = await CreatePaymentApi(payload);
      if (response.data.success) {
        setOpen(false);
        SuccessToast("Payment added successfully!");
        dispatch(fetchCustomers());
          dispatch(fetchSuppliers());
          dispatch(fetchAccountsAmount());
      } else {
        ErrorToast(response.data.error?.msg || "Failed to add payment");
      }
    } catch (err) {
      ErrorToast(err?.response?.data?.error?.msg || err.message);
    }
    setLoading(false);
  };

  return (
    <ModalWrapper
      open={open}
      setOpen={setOpen}
      title="Add New Payment"
      subtitle="Record a customer or supplier payment"
      size="lg"
    >
      <DynamicForm
        fields={fields}
        columns={2}
        defaultValues={{
          depositor: "",
          date: new Date().toISOString().split("T")[0],
          desc: "",
          amount: "",
        }}
        onSubmit={handleSubmit}
        onCancel={() => setOpen(false)}
        submitLabel="Add Payment"
        loading={Loading}
      />
    </ModalWrapper>
  );
};

export default AddNewPaymentModal;

import React, { useEffect, useState } from "react";
import CustomBtn from "../../../components/Buttons/CustomBtn";
import Header from "../../../components/Header/Header";
import SearchableTable from "../../../components/Tables/SearchableTable";
import AddAccountModal from "../../../components/Modals/AddAccountModal";
import { useDispatch, useSelector } from "react-redux";
import { fetchAccountsAmount } from "../../../store/Slices/AccountSlice";
import { useNavigate } from "react-router-dom";
import EditAccountModal from "../../../components/Modals/EditAccountModal";
// import DeleteModal from "../../../components/Modals/DeleteModal";
// import { DeleteAccountsApi } from "../../../ApiRequests";
// import { ErrorToast, SuccessToast } from "../../../utils/ShowToast";
import AddOpeningBalanceModal from "../../../components/Modals/AddOpeningBalanceModal";
import { AccountColumns } from "../../../assets/Columns";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";

const Accounts = () => {
  const [OpenEditModal, setOpenEditModal] = useState(false);
  const [OpenDeleteModal, setOpenDeleteModal] = useState(false);
  const [Selected, setSelected] = useState("");
  const [OpenModal, setOpenModal] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [AddOpeningBalance, setAddOpeningBalance] = useState(false);
  const [SearchText, setSearchText] = useState("");

  const dispatch = useDispatch();
  const AccountState = useSelector((state) => state.AccountState);

  useEffect(() => {
    dispatch(fetchAccountsAmount());
  }, [dispatch]);

  const navigate = useNavigate();

  return (
    <BodyWrapper>
      <Header title="Accounts" desc="Manage your accounts efficiently">
        <CustomBtn
          title={"Summary"}
          onClick={() => {
            navigate("/admin/accounts-summary");
          }}
        />
        <CustomBtn
          title={"Opening Balance"}
          onClick={() => {
            setAddOpeningBalance(true);
          }}
        />
        <CustomBtn
          title={"Add Account"}
          onClick={() => {
            setOpenModal(true);
          }}
        />
      </Header>
      <SearchableTable
        setOpenEditModal={setOpenEditModal}
        setOpenDeleteModal={setOpenDeleteModal}
        setSelected={setSelected}
        SearchPlaceholder={"Search Account Title..."}
        SearchText={SearchText}
        setSearchText={setSearchText}
        CurrentData={(AccountState.data || []).filter((dt) =>
          SearchText === ""
            ? true
            : String(dt.account_name || "")
                .toLowerCase()
                .startsWith(SearchText.toLowerCase())
        )}
        Columns={AccountColumns}
      />
      {OpenModal && <AddAccountModal Open={OpenModal} setOpen={setOpenModal} />}
      {OpenEditModal && (
        <EditAccountModal
          Open={OpenEditModal}
          setOpen={setOpenEditModal}
          account={Selected}
        />
      )}
      {AddOpeningBalance && (
        <AddOpeningBalanceModal
          Open={AddOpeningBalance}
          setOpen={setAddOpeningBalance}
        />
      )}

      {/* {OpenDeleteModal && (
        <DeleteModal
          Open={OpenDeleteModal}
          setOpen={setOpenDeleteModal}
          Loading={Loading}
          onSubmit={async () => {
            setLoading(true);
            try {
              const response = await DeleteAccountsApi(Selected._id);
              if (response.data.success) {
                setOpenDeleteModal(false);
                SuccessToast("Account delete successfully");
                dispatch(fetchAccountsAmount());
              } else {
                ErrorToast(response.data.error?.msg);
              }
            } catch (err) {
              console.log(err);

              ErrorToast(
                err?.response?.data?.error?.msg || "Failed to delete account!"
              );
            }
            setLoading(false);
          }}
        />
      )} */}
    </BodyWrapper>
  );
};

export default Accounts;

import React, { useEffect, useState } from "react";
import BodyWrapper from "../../../components/Wrapper/BodyWrapper";
import Header from "../../../components/Header/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchReport } from "../../../store/Slices/ReportSlice";
import FetchingLoading from "../../../components/Loaders/FetchingLoading";
import SearchableTable from "../../../components/Tables/SearchableTable";
import {
  PaymentReportColumns,
  ExpenseColumns,
  TransactionsColumns,
} from "../../../assets/Columns";
import CustomTabs from "../../../components/Tabs/CustomTabs";
import { AppInput, EmptyState } from "../../../components/ui";

const Report = () => {
  const dispatch = useDispatch();
  const ReportState = useSelector((state) => state.ReportState);
  const [SearchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [SelectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    dispatch(fetchReport({ date: SelectedDate }));
  }, [SelectedDate, dispatch]);

  const expenses = ReportState.data?.expenses || [];
  const payments = ReportState.data?.payments || [];
  const transactions = ReportState.data?.transactions || [];

  const emptyMessages = [
    "No invoices found for this date.",
    "No payments found for this date.",
    "No expenses found for this date.",
  ];

  return (
    <BodyWrapper>
      <Header
        title="Daily Report"
        desc="Overview of invoices, payments, and expenses for a selected day"
      >
        <div className="w-full max-w-[220px]">
          <AppInput
            type="date"
            value={SelectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </Header>

      {ReportState.loading ? (
        <div className="flex flex-1 justify-center items-center py-16">
          <FetchingLoading />
        </div>
      ) : (
        <div className="flex flex-col w-full">
          <div className="mb-4">
            <CustomTabs
              tabs={[
                { label: "Invoices" },
                { label: "Payments" },
                { label: "Expenses" },
              ]}
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setSearchText("");
              }}
            />
          </div>

          {activeTab === 0 &&
            (transactions.length > 0 ? (
              <SearchableTable
                SearchPlaceholder="Search invoices..."
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={transactions}
                Columns={TransactionsColumns.filter(
                  (col) => col.id !== "actions"
                )}
              />
            ) : (
              <EmptyState title="No invoices" description={emptyMessages[0]} />
            ))}

          {activeTab === 1 &&
            (payments.length > 0 ? (
              <SearchableTable
                SearchPlaceholder="Search payments..."
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={payments}
                Columns={PaymentReportColumns}
              />
            ) : (
              <EmptyState title="No payments" description={emptyMessages[1]} />
            ))}

          {activeTab === 2 &&
            (expenses.length > 0 ? (
              <SearchableTable
                SearchPlaceholder="Search expenses..."
                SearchText={SearchText}
                setSearchText={setSearchText}
                CurrentData={expenses}
                Columns={ExpenseColumns.filter((col) => col.id !== "actions")}
              />
            ) : (
              <EmptyState title="No expenses" description={emptyMessages[2]} />
            ))}
        </div>
      )}
    </BodyWrapper>
  );
};

export default Report;

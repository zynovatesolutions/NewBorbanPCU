import React from "react";

const statsData = [
  {
    title: "Total Customers",
    value: "14",
    subtitle: "Last 7 days",
    textColor: "text-black",
  },
  {
    title: "Total Dealer",
    value: "868",
    subtitle: "Dealers",
    textColor: "text-orange-500",
  },
  {
    title: "Rem. Customer",
    value: "5",
    subtitle: "Counter Sale Customer",
    textColor: "text-purple-500",
  },
  {
    title: "Total Recieveable",
    value: "12000",
    subtitle: "Remaining Amount",
    textColor: "text-red-500",
  },
];

const CustomerStatsCard = () => {
  return (
    <div className="flex flex-col bg-white px-6 py-4 rounded-2xl shadow-md gap-y-2 my-3">
      <div className="text-xl font-JakartaSans font-bold">
        Overall Customers
      </div>
      <div className="grid grid-cols-4 bg-white rounded-2xl">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`flex flex-col items-start  px-5 ${
              index === 0 || index === 1 || index === 2
                ? "border-r-[1px] border-r-gray-300"
                : ""
            }`}
          >
            <h4
              className={`text-[1rem] font-Inter font-medium ${stat.textColor}`}
            >
              {stat.title}
            </h4>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                <span className="text-gray-400 text-xs mt-1">
                  {stat.subtitle}
                </span>
              </div>
              {stat?.subtitle2 && (
                <div className="flex flex-col">
                  <p className="text-2xl font-semibold mt-1">{stat.value2}</p>
                  <span className="text-gray-400 text-xs mt-1">
                    {stat.subtitle2}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerStatsCard;

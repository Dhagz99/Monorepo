import {
    Download,
    Eye,
    Filter,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
  } from "lucide-react";
  
  export default function Borrowers() {
    return (
      <div className="p-8 bg-slate-100 min-h-screen flex flex-col gap-7">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Borrowers
            </h1>
  
            <p className="text-slate-500 mt-1">
              Manage borrower master records
            </p>
          </div>
  
          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <button
              className="
                h-11 px-5 rounded-2xl
                border border-slate-200
                bg-white hover:bg-slate-100
                transition
                flex items-center gap-2
                text-sm font-medium text-slate-700
              "
            >
              <Download size={18} />
  
              Export
            </button>
  
            <button
              className="
                h-11 px-5 rounded-2xl
                bg-blue-600 hover:bg-blue-700
                transition
                flex items-center gap-2
                text-sm font-medium text-white
                shadow-lg shadow-blue-500/20
              "
            >
              <Plus size={18} />
  
              Add Borrower
            </button>
          </div>
        </div>
  
        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm">
                  Total Borrowers
                </p>
  
                <h2 className="text-3xl font-bold text-slate-800 mt-3">
                  1,245
                </h2>
              </div>
  
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Users
                  className="text-blue-600"
                  size={28}
                />
              </div>
            </div>
          </div>
  
          {/* CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div>
              <p className="text-slate-500 text-sm">
                Active Borrowers
              </p>
  
              <h2 className="text-3xl font-bold text-slate-800 mt-3">
                982
              </h2>
            </div>
          </div>
  
          {/* CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div>
              <p className="text-slate-500 text-sm">
                New This Month
              </p>
  
              <h2 className="text-3xl font-bold text-slate-800 mt-3">
                52
              </h2>
            </div>
          </div>
        </div>
  
        {/* TABLE SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {/* TOP */}
          <div className="p-6 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* SEARCH */}
            <div className="relative w-full xl:w-87.5">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
  
              <input
                type="text"
                placeholder="Search borrower..."
                className="
                  w-full h-11 rounded-2xl
                  border border-slate-200
                  bg-slate-50
                  pl-11 pr-4
                  text-sm
                  outline-none
                  focus:ring-2 focus:ring-blue-500
                  focus:border-blue-500
                "
              />
            </div>
  
            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="
                  h-11 px-4 rounded-2xl
                  border border-slate-200
                  bg-white
                  text-sm text-slate-700
                  outline-none
                "
              >
                <option>All Branches</option>
              </select>
  
              <select
                className="
                  h-11 px-4 rounded-2xl
                  border border-slate-200
                  bg-white
                  text-sm text-slate-700
                  outline-none
                "
              >
                <option>All Status</option>
              </select>
  
              <button
                className="
                  h-11 px-4 rounded-2xl
                  border border-slate-200
                  bg-white hover:bg-slate-100
                  transition
                  flex items-center gap-2
                  text-sm font-medium
                "
              >
                <Filter size={18} />
  
                Filters
              </button>
            </div>
          </div>
  
          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* HEAD */}
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Subject No
                  </th>
  
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Full Name
                  </th>
  
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Gender
                  </th>
  
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Birth Date
                  </th>
  
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Branch
                  </th>
  
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>
  
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
  
              {/* BODY */}
              <tbody>
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr
                    key={item}
                    className="border-t border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-5 text-sm text-slate-700 font-medium">
                      CUS-000{item}
                    </td>
  
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Juan Dela Cruz
                        </p>
  
                        <p className="text-xs text-slate-500 mt-1">
                          juan@gmail.com
                        </p>
                      </div>
                    </td>
  
                    <td className="px-6 py-5 text-sm text-slate-700">
                      Male
                    </td>
  
                    <td className="px-6 py-5 text-sm text-slate-700">
                      Jan 01, 1990
                    </td>
  
                    <td className="px-6 py-5 text-sm text-slate-700">
                      Main Branch
                    </td>
  
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        Active
                      </span>
                    </td>
  
                    {/* ACTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="
                            w-10 h-10 rounded-xl
                            bg-slate-100 hover:bg-slate-200
                            transition
                            flex items-center justify-center
                            text-slate-700
                          "
                        >
                          <Eye size={18} />
                        </button>
  
                        <button
                          className="
                            w-10 h-10 rounded-xl
                            bg-blue-100 hover:bg-blue-200
                            transition
                            flex items-center justify-center
                            text-blue-700
                          "
                        >
                          <Pencil size={18} />
                        </button>
  
                        <button
                          className="
                            w-10 h-10 rounded-xl
                            bg-red-100 hover:bg-red-200
                            transition
                            flex items-center justify-center
                            text-red-700
                          "
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          {/* PAGINATION */}
          <div className="p-6 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing 1 to 5 of 1,245 borrowers
            </p>
  
            <div className="flex items-center gap-2">
              <button
                className="
                  w-10 h-10 rounded-xl
                  border border-slate-200
                  hover:bg-slate-100
                  transition
                "
              >
                1
              </button>
  
              <button
                className="
                  w-10 h-10 rounded-xl
                  border border-slate-200
                  hover:bg-slate-100
                  transition
                "
              >
                2
              </button>
  
              <button
                className="
                  w-10 h-10 rounded-xl
                  border border-slate-200
                  hover:bg-slate-100
                  transition
                "
              >
                3
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
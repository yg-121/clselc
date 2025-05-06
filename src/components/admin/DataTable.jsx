
"use client"

import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from "react-feather"

const DataTable = ({
  columns,
  data,
  initialState = {},
  filterPlaceholder = "Search...",
  showFilter = true,
  showPagination = true,
}) => {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState([])

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    initialState: {
      ...initialState,
      pagination: {
        pageSize: initialState.pageSize || 10, // Default to 10 rows per page
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleFilterChange = (e) => {
    const value = e.target.value || ""
    setGlobalFilter(value)
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {showFilter && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={globalFilter}
              onChange={handleFilterChange}
              placeholder={filterPlaceholder}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      header.column.getCanSort() ? "cursor-pointer" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span>
                          {{
                            asc: <ChevronUp className="h-4 w-4" />,
                            desc: <ChevronDown className="h-4 w-4" />,
                          }[header.column.getIsSorted()] || null}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                !table.getCanPreviousPage()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                !table.getCanNextPage()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    data.length
                  )}
                </span>{" "}
                of <span className="font-medium">{data.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    !table.getCanPreviousPage() ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {table.getPageCount() <= 7
                  ? Array.from({ length: table.getPageCount() }, (_, i) => i).map((page) => (
                      <button
                        key={page}
                        onClick={() => table.setPageIndex(page)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          page === table.getState().pagination.pageIndex
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page + 1}
                      </button>
                    ))
                  : [
                      0,
                      1,
                      2,
                      table.getState().pagination.pageIndex - 1,
                      table.getState().pagination.pageIndex,
                      table.getState().pagination.pageIndex + 1,
                      table.getPageCount() - 3,
                      table.getPageCount() - 2,
                      table.getPageCount() - 1,
                    ]
                      .filter(
                        (page) =>
                          page >= 0 &&
                          page < table.getPageCount() &&
                          (page <= 2 ||
                            page >= table.getPageCount() - 3 ||
                            Math.abs(page - table.getState().pagination.pageIndex) <= 1)
                      )
                      .filter((page, index, array) => array.indexOf(page) === index)
                      .sort((a, b) => a - b)
                      .map((page, i, array) => {
                        const showEllipsis = i > 0 && page > array[i - 1] + 1
                        return (
                          <div key={page}>
                            {showEllipsis && (
                              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => table.setPageIndex(page)}
                              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                page === table.getState().pagination.pageIndex
                                  ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                  : "text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page + 1}
                            </button>
                          </div>
                        )
                      })}
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    !table.getCanNextPage() ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable

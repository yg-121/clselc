const ChartCard = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-white shadow rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="flex justify-center">{children}</div>
    </div>
  )
}

export default ChartCard

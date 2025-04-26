function Footer() {
  return (
    <footer className="bg-navy text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
            <span className="ml-2 text-xl font-bold">Legal Connect</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-gold font-medium">Connect. Resolve. Succeed.</p>
            <p className="text-sm mt-2">&copy; {new Date().getFullYear()} Connected Ethiopian Lawyers and Clients</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

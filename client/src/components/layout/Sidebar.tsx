import { NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Menu,
  X,
  TrendingUp,
  Package,
} from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { useAppSelector } from '../../hooks/useRedux';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Plans',
      path: '/plans',
      icon: CreditCard,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: TrendingUp,
    },
  ];

  const adminItems = [
    {
      name: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: Users,
    },
    {
      name: 'Plans Management',
      path: '/admin/plans',
      icon: Package,
    },
    {
  name: 'Users',
  path: '/admin/users',
  icon: Users,
},
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          {sidebarOpen && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              SubsManager
            </span>
          )}
        </div>
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
              } ${!sidebarOpen && 'justify-center'}`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>{item.name}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
              {sidebarOpen && (
                <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  Admin
                </p>
              )}
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                    } ${!sidebarOpen && 'justify-center'}`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      {sidebarOpen && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4">
            <p className="text-sm font-semibold text-primary-900 dark:text-primary-300 mb-1">
              Need help?
            </p>
            <p className="text-xs text-primary-700 dark:text-primary-400 mb-3">
              Check our documentation
            </p>
            <button className="w-full px-3 py-2 bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-400 rounded-lg text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              View Docs
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
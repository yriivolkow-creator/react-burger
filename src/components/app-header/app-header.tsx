import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { Link, NavLink } from 'react-router-dom';

import styles from './app-header.module.css';

const getLinkClass = (isActive: boolean, extraClass = ''): string =>
  `${styles.link} ${isActive ? styles.link_active : ''} ${extraClass}`;

export const AppHeader = (): React.JSX.Element => (
  <header className={styles.header}>
    <nav className={`${styles.menu} p-4`}>
      <div className={styles.menu_part_left}>
        <NavLink className={({ isActive }) => getLinkClass(isActive)} end to="/">
          {({ isActive }) => (
            <>
              <BurgerIcon type={isActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2">Конструктор</p>
            </>
          )}
        </NavLink>
        <NavLink
          className={({ isActive }) => getLinkClass(isActive, 'ml-10')}
          to="/feed"
        >
          {({ isActive }) => (
            <>
              <ListIcon type={isActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2">Лента заказов</p>
            </>
          )}
        </NavLink>
      </div>
      <Link aria-label="Stellar Burgers" className={styles.logo} to="/">
        <Logo />
      </Link>
      <NavLink
        className={({ isActive }) => getLinkClass(isActive, styles.link_position_last)}
        to="/profile"
      >
        {({ isActive }) => (
          <>
            <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
            <p className="text text_type_main-default ml-2">Личный кабинет</p>
          </>
        )}
      </NavLink>
    </nav>
  </header>
);

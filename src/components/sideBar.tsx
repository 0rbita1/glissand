import "../styles/sideBar.css";

interface SideBarProps {
  isOpen: boolean;
}

function SideBar({ isOpen }: SideBarProps) {
  if (!isOpen) return null;

  return <div className="sidebar" />;
}

export default SideBar;

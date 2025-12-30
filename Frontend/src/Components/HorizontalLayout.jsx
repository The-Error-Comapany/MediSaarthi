import { Link, Outlet, useLocation } from "react-router-dom";
import "./horizonntalLayout.css"
import Header from "./header";
import Footer from "./footer";

const HorizontalLayout = () => {

  return (
    <div className="d-flex flex-column min-vh-100 layout-root">
      
    <Header/>
    <main 
      className="flex-grow-1" 
      style={{ paddingTop: `80px` }} 
    >
    <div className="container-xl mx-auto px-4">
      <Outlet />
    </div>
    </main>
    <Footer/>
    </div>
  );
};

export default HorizontalLayout;
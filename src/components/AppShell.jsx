import logo from "../assets/logo.png";
import { shellStyles } from "./layoutStyles";

export default function AppShell({
  portalTitle,
  children,
  navLabel = "| MESS PORTAL - NITJ |",
}) {
  return (
    <div style={shellStyles.page}>
      <div style={shellStyles.topStrip}></div>

      <header style={shellStyles.header}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="NIT Jalandhar" style={{ height: "90px", width: "auto" }} />

            <div className="text-white">
              <p
                style={{
                  fontFamily: "Times New Roman",
                  letterSpacing: "1px",
                  fontSize: "22px",
                  lineHeight: "30px",
                  margin: 0,
                }}
              >
                Dr B R Ambedkar National Institute of Technology, Jalandhar
              </p>
              <p style={{ margin: 0, fontSize: "14px" }}>{portalTitle}</p>
            </div>
          </div>
        </div>
      </header>

      <nav style={shellStyles.nav}>
        <div className="container mx-auto px-4">
          <span style={shellStyles.navText}>{navLabel}</span>
        </div>
      </nav>

      <main style={{ flex: 1 }}>{children}</main>

      <footer style={shellStyles.footer}>
        <p style={shellStyles.footerText}>
          Copyright 2026 © NIT Jalandhar
          <br />
          Developed by: Computer Centre, Dr. B.R. Ambedkar National Institute of Technology,
          Jalandhar
        </p>
      </footer>
    </div>
  );
}

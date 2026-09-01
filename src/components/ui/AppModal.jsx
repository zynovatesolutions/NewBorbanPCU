import React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import { IoClose } from "react-icons/io5";

const sizeMap = {
  sm: 420,
  md: 560,
  lg: 720,
  xl: 900,
  auto: "fit-content",
};

export default function AppModal({
  open,
  setOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  hideClose = false,
}) {
  const handleClose = () => {
    if (onClose) onClose();
    else if (setOpen) setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "min(92vw, " + (typeof sizeMap[size] === "number" ? sizeMap[size] + "px" : sizeMap[size]) + ")",
            maxHeight: "90vh",
            bgcolor: "background.paper",
            borderRadius: "16px",
            boxShadow: 24,
            outline: "none",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {(title || !hideClose) && (
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                {title && (
                  <h2 className="text-lg font-bold text-slate-900 truncate">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
                )}
              </div>
              {!hideClose && (
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                  aria-label="Close"
                >
                  <IoClose className="text-xl" />
                </button>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <div className="border-t border-slate-200 px-5 py-4 bg-slate-50">
              {footer}
            </div>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}

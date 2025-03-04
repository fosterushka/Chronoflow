import { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { createPortal } from "preact/compat";

interface PortalProps {
  children: JSX.Element;
}

export default function Portal({ children }: PortalProps) {
  const portalRoot = useRef<HTMLDivElement | null>(null);
  const container = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let root = document.getElementById("portal-root") as HTMLDivElement;
    if (!root) {
      root = document.createElement("div");
      root.id = "portal-root";
      root.style.position = "fixed";
      root.style.zIndex = "9999";
      root.style.top = "0";
      root.style.left = "0";
      root.style.width = "100%";
      root.style.height = "100%";
      root.style.pointerEvents = "none";
      document.body.appendChild(root);
    }
    portalRoot.current = root;

    const div = document.createElement("div");
    div.style.pointerEvents = "auto";
    container.current = div;
    portalRoot.current.appendChild(container.current);

    return () => {
      if (container.current && portalRoot.current) {
        portalRoot.current.removeChild(container.current);
      }
    };
  }, []);

  if (!container.current) {
    return null;
  }

  return createPortal(children, container.current);
}

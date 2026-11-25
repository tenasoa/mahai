import { describe, expect, it } from "vitest";

import { typeImage } from "./medias";

const octets = (...valeurs: (number | string)[]) =>
  new Uint8Array(
    valeurs.flatMap((v) => (typeof v === "string" ? [...v].map((c) => c.charCodeAt(0)) : [v])),
  );

describe("type des images", () => {
  it("reconnaît PNG, JPEG, WebP et GIF par leurs premiers octets", () => {
    expect(typeImage(octets(0x89, "PNG", 0x0d, 0x0a))?.ext).toBe("png");
    expect(typeImage(octets(0xff, 0xd8, 0xff, 0xe0))?.ext).toBe("jpg");
    expect(typeImage(octets("RIFF", 0, 0, 0, 0, "WEBPVP8 "))?.ext).toBe("webp");
    expect(typeImage(octets("GIF89a"))?.ext).toBe("gif");
  });

  it("refuse le reste, même avec une extension d'image", () => {
    expect(typeImage(octets("<svg xmlns"))).toBeNull();
    expect(typeImage(octets("<html><script>"))).toBeNull();
    expect(typeImage(octets("%PDF-1.7"))).toBeNull();
  });
});

import Image, { ImageProps } from "next/image";

type ResponsiveImageProps = Omit<ImageProps, "alt"> & {
  alt: string;
  minWidth?: string;
  maxWidth?: string;
  align?: "left" | "center" | "right";
  containerClassName?: string;
  imageClassName?: string;
};

export default function ResponsiveImage({
  alt,
  minWidth,
  maxWidth,
  align = "left",
  containerClassName = "",
  imageClassName = "",
  className,
  ...props
}: ResponsiveImageProps) {
  const alignment =
    align === "center"
      ? "mx-auto"
      : align === "right"
      ? "ml-auto"
      : "";

  return (
    <div
      className={`
        relative
        w-full
        shrink-0
        ${alignment}
        ${containerClassName}
      `}
      style={{
        minWidth,
        maxWidth,
      }}
    >
      <Image
        alt={alt}
        {...props}
        className={`
          w-full
          h-auto
          object-contain
          ${imageClassName}
          ${className ?? ""}
        `}
      />
    </div>
  );
}
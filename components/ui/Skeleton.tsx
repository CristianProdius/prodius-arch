interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export const Skeleton = ({
  className = "",
  width,
  height,
  rounded = false,
}: SkeletonProps) => (
  <div
    className={`skeleton ${rounded ? "skeleton--rounded" : ""} ${className}`}
    style={{ width, height }}
  />
);

export const ProjectCardSkeleton = () => (
  <div className="project-card-skeleton">
    <div className="skeleton-preview">
      <Skeleton height="100%" />
    </div>
    <div className="skeleton-body">
      <div>
        <Skeleton width="60%" height="20px" />
        <Skeleton width="40%" height="14px" />
      </div>
      <Skeleton width="40px" height="40px" rounded />
    </div>
  </div>
);

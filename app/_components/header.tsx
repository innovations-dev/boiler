import * as React from 'react';
import Link from 'next/link';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { Container } from '@/components/container';
import { MainNav } from '@/components/header/main-nav';
import { MobileNav } from '@/components/header/mobile-nav';
import { UserNav } from '@/components/header/user-nav';
import { Skeleton } from '@/components/ui/skeleton';
import { navigationRoutes } from '@/config/routes.config';
import { cn } from '@/lib/utils';

const headerVariants = cva(
  'w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50',
  {
    variants: {
      variant: {
        default: 'border-b border-border bg-background/95',
        transparent: 'border-transparent bg-transparent',
        contrast: 'border-muted bg-muted/50',
        floating:
          'bg-background/60 border shadow-sm mx-auto max-w-7xl rounded-full mt-4 backdrop-blur-lg',
        page: 'bg-transparent border-none',
      },
      size: {
        default: 'h-16',
        sm: 'h-14',
        lg: 'h-20',
        page: 'min-h-[4rem]',
      },
      position: {
        default: 'sticky top-0',
        fixed: 'fixed inset-x-0 top-4',
        relative: 'relative',
      },
      sticky: {
        true: 'sticky top-0',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      position: 'default',
      sticky: true,
    },
  }
);

interface HeaderRootProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headerVariants> {
  as?: React.ElementType;
  containerClassName?: string;
  isFullWidth?: boolean;
  sticky?: boolean;
}

interface HeaderElementProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

interface HeaderLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  isActive?: boolean;
}

const HeaderRoot = React.forwardRef<HTMLElement, HeaderRootProps>(
  (
    {
      className,
      as: Component = 'header',
      containerClassName,
      variant,
      size,
      position,
      sticky,
      isFullWidth = false,
      children,
      ...props
    },
    ref
  ) => {
    const Wrapper = isFullWidth ? React.Fragment : Container;
    const wrapperProps = isFullWidth ? {} : { className: containerClassName };

    return (
      <Component
        ref={ref}
        className={cn(
          headerVariants({ variant, size, position, sticky }),
          'fixed left-0 right-0 top-0 isolate',
          className
        )}
        {...props}
      >
        <Wrapper {...wrapperProps}>
          <div className="flex min-h-16 items-center justify-between gap-4 px-4">
            {children}
          </div>
        </Wrapper>
      </Component>
    );
  }
);
HeaderRoot.displayName = 'Header';

const HeaderLeftElement = React.forwardRef<HTMLDivElement, HeaderElementProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn('flex items-center gap-6', className)}
        {...props}
      />
    );
  }
);
HeaderLeftElement.displayName = 'Header.LeftElement';

const HeaderMain = React.forwardRef<HTMLDivElement, HeaderElementProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn(
          'flex flex-1 items-center justify-center gap-6',
          className
        )}
        {...props}
      />
    );
  }
);
HeaderMain.displayName = 'Header.Main';

const HeaderRightElement = React.forwardRef<HTMLDivElement, HeaderElementProps>(
  ({ asChild, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    return (
      <Comp
        ref={ref}
        className={cn('flex items-center gap-6', className)}
        {...props}
      />
    );
  }
);
HeaderRightElement.displayName = 'Header.RightElement';

const HeaderLink = React.forwardRef<HTMLAnchorElement, HeaderLinkProps>(
  ({ className, isActive, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(
          'relative text-sm font-medium transition-colors hover:text-foreground/80',
          isActive &&
            'text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-foreground',
          !isActive && 'text-foreground/60',
          className
        )}
        {...props}
      />
    );
  }
);
HeaderLink.displayName = 'Header.Link';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  isLoading?: boolean;
}

function PageHeader({
  title,
  description,
  icon,
  action,
  className,
  as: Comp = 'h1',
  isLoading = false,
}: PageHeaderProps) {
  const headingId = title
    ? `${title.toLowerCase().replace(/\s+/g, '-')}-heading`
    : undefined;
  const descriptionId = title
    ? `${title.toLowerCase().replace(/\s+/g, '-')}-description`
    : undefined;

  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {icon && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted sm:h-12 sm:w-12"
              aria-hidden="true"
              role="presentation"
            >
              {isLoading ? <Skeleton className="h-6 w-6" /> : icon}
            </div>
          )}
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <Skeleton className="h-8 w-[200px]" />
            ) : (
              <Comp
                id={headingId}
                className="text-xl font-semibold tracking-tight sm:text-2xl"
                aria-describedby={description ? descriptionId : undefined}
              >
                {title}
              </Comp>
            )}
            {description &&
              (isLoading ? (
                <Skeleton className="h-5 w-[300px]" />
              ) : (
                <p
                  id={descriptionId}
                  className="text-sm text-muted-foreground"
                  aria-labelledby={headingId}
                >
                  {description}
                </p>
              ))}
          </div>
        </div>
        {action && (
          <div className="flex-shrink-0">
            {isLoading ? <Skeleton className="h-9 w-[100px]" /> : action}
          </div>
        )}
      </div>
    </div>
  );
}

const Header = Object.assign(HeaderRoot, {
  LeftElement: HeaderLeftElement,
  Main: HeaderMain,
  RightElement: HeaderRightElement,
  Link: HeaderLink,
  Page: PageHeader,
});

// Example usage with active link indicator
export function SiteHeader() {
  return (
    <Header
      variant="floating"
      position="fixed"
      size="default"
      className="mx-auto max-w-7xl px-4"
    >
      <Header.LeftElement>
        <Link href="/" className="font-semibold">
          Your Logo
        </Link>
      </Header.LeftElement>
      <Header.Main>
        <MainNav
          items={[...navigationRoutes.main, ...navigationRoutes.product]}
        />
      </Header.Main>
      <Header.RightElement>
        <UserNav items={navigationRoutes.auth} />
      </Header.RightElement>
      <MobileNav items={navigationRoutes.main} />
    </Header>
  );
}

export { Header, headerVariants };

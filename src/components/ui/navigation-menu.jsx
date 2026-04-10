"use client"

import { useState, useEffect, useCallback, forwardRef } from "react"
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { UserCog, LogOut, Menu, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AlertConfirmationRedDialog } from '@/components/ui/alert-dialog'
import ChatModal from '@/components/ui/chatmodal'
import NavbarNotification from '@/components/ui/navbar-notification'
import PersuratanDropdown from '@/features/persuratan/components/PersuratanDropdown'
<<<<<<< HEAD
import BimbinganDropdown from '@/features/bimbingan-ta/components/BimbinganDropdown'
=======
import BimbinganDropdown from '@/features/bimbingan/components/BimbinganDropdown'
import LibraryDropdown from '@/features/library/components/LibraryDropdown'
>>>>>>> origin/tugasakhir
import { useAuth } from '@/lib/auth-context'
import { logout } from '@/lib/sessionApi'
import { getCurrentRole, getThesisHomePath } from '@/features/bimbingan-ta/utils'

const isMenuActive = (pathname, href) =>
  pathname === href || pathname.startsWith(`${href}/`)

const NavbarBrand = forwardRef(({ className, isScrolled, ...props }, ref) => (
  <Link
    href="/dashboard"
    ref={ref}
    className={cn("flex items-center gap-2 sm:gap-3 transition-all duration-300", className)}
    {...props}
  >
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center p-1 shrink-0 transition-all duration-300">
      <Image
        src="/Logo.png"
        alt="UGN Logo"
        width={80}
        height={80}
        className="rounded-full"
      />
    </div>
    <span className="text-brand-yellow font-semibold text-sm sm:text-base md:text-lg tracking-wide hidden sm:inline transition-all duration-300" style={{ color: '#DABC4E' }}>
      Universitas Global Nusantara
    </span>
  </Link>
))

<<<<<<< HEAD
const NavbarMenu = forwardRef(({ className, isMobileMenuOpen, setIsMobileMenuOpen, ...props }, ref) => {
  const { user } = useAuth();
  const userRole = user?.roles;

  return (
=======
const NavbarMenu = forwardRef(({ className, isMobileMenuOpen, setIsMobileMenuOpen, thesisHref, role, ...props }, ref) => (
>>>>>>> origin/tugasakhir
  <>
    {/* Desktop Menu */}
    <div
      ref={ref}
      className={cn("hidden md:flex items-center gap-4 lg:gap-6", className)}
      {...props}
    >
      <NavbarMenuItem href="/akademik">Akademik</NavbarMenuItem>
      <NavbarMenuItem href="/kehadiran">Kehadiran</NavbarMenuItem>
      <NavbarMenuItem href="/hasil-studi">Hasil Studi</NavbarMenuItem>
      {role === 'mahasiswa' || role === 'dosen' ? (
        <BimbinganDropdown role={role} />
      ) : (
        <NavbarMenuItem href={thesisHref}>Bimbingan TA</NavbarMenuItem>
      )}
      <LibraryDropdown />
      <PersuratanDropdown />
      <BimbinganDropdown role={userRole} />
    </div>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    )}

    {/* Mobile Menu Sidebar */}
    <div
      className={cn(
        "fixed top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden w-64",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Mobile Menu Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: '#015023' }}>
        <span className="text-white font-semibold text-lg">Menu</span>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Mobile Menu Items */}
      <div className="flex flex-col p-4 gap-2">
        <MobileNavMenuItem
          href="/akademik"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Akademik
        </MobileNavMenuItem>
        <MobileNavMenuItem
          href="/kehadiran"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Kehadiran
        </MobileNavMenuItem>
        <MobileNavMenuItem
          href="/hasil-studi"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Hasil Studi
        </MobileNavMenuItem>
        {role === 'mahasiswa' ? (
          <>
            <MobileNavMenuItem
              href="/bimbingan/pengajuan-ta"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pengajuan TA
            </MobileNavMenuItem>
            <MobileNavMenuItem
              href="/bimbingan/galeri-judul"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Galeri Judul TA
            </MobileNavMenuItem>
            <MobileNavMenuItem
              href="/bimbingan/monitoring"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Monitoring
            </MobileNavMenuItem>
          </>
        ) : role === 'dosen' ? (
          <>
            <MobileNavMenuItem
              href="/bimbingan-ta/dosen/topik"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Kelola Judul TA
            </MobileNavMenuItem>
            <MobileNavMenuItem
              href="/bimbingan-ta/dosen/permintaan"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Validasi Pengajuan
            </MobileNavMenuItem>
            <MobileNavMenuItem
              href="/bimbingan-ta/dosen/bimbingan"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Monitoring Bimbingan
            </MobileNavMenuItem>
          </>
        ) : (
          <MobileNavMenuItem
            href={thesisHref}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Bimbingan TA
          </MobileNavMenuItem>
        )}
        <MobileNavMenuItem
          href="/library/books"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Katalog Buku
        </MobileNavMenuItem>
        <MobileNavMenuItem
          href="/library/activities"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Aktivitas Perpustakaan
        </MobileNavMenuItem>
        <MobileNavMenuItem
          href="/library/suggestions"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Usulan Buku
        </MobileNavMenuItem>
        <MobileNavMenuItem
          href="/persuratan/ajukan"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Ajukan Surat
        </MobileNavMenuItem>
        <MobileNavMenuItem
          href="/persuratan/status"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Status Persuratan
        </MobileNavMenuItem>

        {/* Bimbingan section */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <span className="px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Bimbingan</span>
        </div>
        {userRole === 'dosen' ? (
          <>
            <MobileNavMenuItem
              href="/dosen/bimbingan/kelola-judul"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Kelola Judul TA
            </MobileNavMenuItem>
            <MobileNavMenuItem
              href="/dosen/bimbingan/validasi"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Validasi Pengajuan TA
            </MobileNavMenuItem>
            <MobileNavMenuItem
              href="/dosen/bimbingan/monitoring"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Monitoring
            </MobileNavMenuItem>
          </>
        ) : (
          <>
            <MobileNavMenuItem
              href="/bimbingan/pengajuan"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Status Pengajuan TA
            </MobileNavMenuItem>
            <MobileNavMenuItem
              href="/bimbingan/pengajuan/buat"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pengajuan TA
            </MobileNavMenuItem>
            <MobileNavMenuItem
              href="/bimbingan/galeri-judul"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Galeri Judul TA
            </MobileNavMenuItem>
            <MobileNavMenuItem
              href="/bimbingan/monitoring"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Monitoring
            </MobileNavMenuItem>
          </>
        )}
      </div>
    </div>
  </>
  );
})

const MobileNavMenuItem = forwardRef(({ className, href, children, onClick, ...props }, ref) => {
  const pathname = usePathname();
  const isActive = isMenuActive(pathname, href);

  return (
    <Link
      href={href}
      ref={ref}
      onClick={onClick}
      className={cn(
        "px-4 py-3 rounded-lg font-medium text-base transition-colors duration-200",
        isActive
          ? "bg-green-50 text-green-700"
          : "text-gray-700 hover:bg-gray-50",
        className
      )}
      style={isActive ? { backgroundColor: '#E6F4EA', color: '#015023' } : {}}
      {...props}
    >
      {children}
    </Link>
  );
})

const NavbarMenuItem = forwardRef(({ className, href, children, ...props }, ref) => {
  const pathname = usePathname();
  const isActive = isMenuActive(pathname, href);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      ref={ref}
      className={cn(
        "text-white hover:text-brand-yellow transition-colors duration-200 font-medium text-sm lg:text-base relative pb-1",
        className
      )}
      style={{ '--hover-color': '#DABC4E' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
      {(isActive || isHovered) && (
        <span
          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-opacity duration-200"
          style={{ backgroundColor: '#DABC4E' }}
        />
      )}
    </Link>
  );
})

const NavbarActions = forwardRef(({ className, isScrolled, ...props }, ref) => {
  // Chat modal state - shared between NavbarNotification and other components
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatUser, setChatUser] = useState({ id: '', name: '', nim: '', conversationId: '' });

  const handleChatClose = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  return (
    <>
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4 sm:gap-6 lg:gap-10 transition-all duration-300",
          className
        )}
        {...props}
      >
        <NavbarNotification
          isChatOpen={isChatOpen}
          chatUser={chatUser}
          setChatUser={setChatUser}
          setIsChatOpen={setIsChatOpen}
          isScrolled={isScrolled}
        />
        <NavbarProfile isScrolled={isScrolled} />
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={handleChatClose}
        userId={chatUser.id}
        userName={chatUser.name}
        userNim={chatUser.nim}
        conversationId={chatUser.conversationId}
      />
    </>
  );
})

const NavbarProfile = forwardRef(({ className, userName, userImage, Name, isScrolled, ...props }, ref) => {
  const router = useRouter()
  const { user, logoutLocal } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const displayuserName = userName || user.username;
  const displayName = Name || user.name;
  const displayImage = userImage || user.image;

  const confirmLogout = async () => {
    setShowLogoutDialog(false);
    let serverMessage = '';
    try {
      const response = await logout();
      if (response.status !== 'success') {
        serverMessage = response.message || '';
      }
    } catch (error) {
      console.error('Error saat logout:', error);
      serverMessage = error?.message || error?.response?.data?.message || '';
    } finally {
      logoutLocal();
      if (serverMessage) console.warn('Logout info:', serverMessage);
      router.push('/loginpage');
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            ref={ref}
            className={cn(
              "transition-all duration-200 hover:scale-105 hover:opacity-90 cursor-pointer focus:outline-none",
              className
            )}
            {...props}
          >
            <Avatar className="size-9 sm:size-10 transition-all duration-300">
              <AvatarImage src={displayImage} alt={displayuserName} />
              <AvatarFallback>
                {displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold" style={{ color: 'brand-green', fontFamily: 'Urbanist, sans-serif' }}>
                {displayName || '...'}
              </p>
              <p className="text-xs" style={{ color: 'brand-green', opacity: 0.6, fontFamily: 'Urbanist, sans-serif' }}>
                {displayuserName || '...'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profilepage" className="flex items-center cursor-pointer">
              <UserCog className="mr-2 h-4 w-4" />
              <span>Profile Management</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setShowLogoutDialog(true)}
            className="cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertConfirmationRedDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title='Konfirmasi Logout'
        description='Apakah Anda yakin ingin keluar dari sistem?'
        confirmText='Logout'
        onConfirm={confirmLogout}
      />
    </>
  )
})

const Navbar = forwardRef(({ className, ...props }, ref) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const role = user.roles || getCurrentRole();
  const thesisHref = role === 'mahasiswa' ? '/bimbingan/pengajuan-ta' : getThesisHomePath(role);

  // Handle scroll event for floating navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cn(
      "w-full transition-all duration-300",
      isScrolled ? "fixed top-0 left-0 right-0 z-50 py-3 sm:py-4" : "relative"
    )}>
      <nav
        ref={ref}
        className={cn(
          "bg-brand-green transition-all duration-300 ease-in-out",
          isScrolled
            ? "mx-4 sm:mx-6 lg:mx-8 rounded-[12px] sm:rounded-[18px]"
            : "shadow-md rounded-b-[12px] sm:rounded-b-[18px] rounded-t-none",
          className
        )}
        style={{
          backgroundColor: '#015023',
          ...(isScrolled && {
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1)'
          })
        }}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 sm:h-20 transition-all duration-300">
            <div className="flex items-center gap-3">
              {/* Hamburger Menu Button - Only visible on mobile/tablet (<800px) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white hover:text-gray-200 transition-colors p-2"
                aria-label="Toggle menu"
              >
                <Menu size={24} className="transition-all duration-300" />
              </button>
              <NavbarBrand isScrolled={isScrolled} />
            </div>
            <div className="flex items-center gap-6 sm:gap-10 lg:gap-13">
              <NavbarMenu
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                thesisHref={thesisHref}
                role={role}
              />
              <NavbarActions isScrolled={isScrolled} />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
})

NavbarBrand.displayName = "NavbarBrand"
NavbarMenu.displayName = "NavbarMenu"
NavbarMenuItem.displayName = "NavbarMenuItem"
MobileNavMenuItem.displayName = "MobileNavMenuItem"
NavbarActions.displayName = "NavbarActions"
NavbarProfile.displayName = "NavbarProfile"
Navbar.displayName = "Navbar"

export {
  Navbar,
  NavbarBrand,
  NavbarMenu,
  NavbarMenuItem,
  MobileNavMenuItem,
  NavbarActions,
  NavbarProfile
}

export default Navbar

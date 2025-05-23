import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/authHooks1.jsx"
import { useApi } from "../../hooks/useApi1.jsx"
import { useChat } from "../../context/ChatContext.jsx"
import { chat } from "../../services/api1.js"
import socketService from "../../services/socket1.js"
import { toast } from "react-hot-toast"
import { FaFilePdf, FaFileWord, FaFileImage, FaFileAudio, FaFile } from "react-icons/fa"
import { Button } from "../../components/ui/button.jsx"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog.jsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu.jsx"
import { Badge } from "../../components/ui/badge.jsx"
import { Send, Paperclip, MoreHorizontal, Trash2, Mic, Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

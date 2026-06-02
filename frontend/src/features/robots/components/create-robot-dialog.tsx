"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";

import { CreateRobotForm } from "./create-robot-form";

export function CreateRobotDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("createRobotDialog.trigger")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createRobotDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("createRobotDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <CreateRobotForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}

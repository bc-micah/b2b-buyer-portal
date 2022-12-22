import {
  useRef,
  useState,
  ReactElement,
  useEffect,
  useContext,
} from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  Divider,
} from '@mui/material'

import {
  useMobile,
} from '@/hooks'

import {
  ThemeFrameContext,
} from '@/components/ThemeFrame'

import {
  addProductToShoppingList,
} from '@/shared/service/b2b'

import {
  snackbar,
} from '@/utils'

import {
  OrderCheckboxProduct,
} from './OrderCheckboxProduct'

import {
  OrderShoppingList,
} from './OrderShoppingList'
import CreateShoppingList from './CreateShoppingList'

import {
  EditableProductItem,
  OrderProductItem,
  OrderCurrency,
} from '../../../types'

interface DialogData{
  dialogTitle: string,
  type: string,
  description: string,
  confirmText: string,
}

interface OrderDialogProps {
  open: boolean,
  setOpen: (open: boolean) => void,
  products?: OrderProductItem[],
  type?: string,
  currentDialogData?: DialogData,
  itemKey: string,
  currencyInfo: OrderCurrency,
}

export const OrderDialog: (props: OrderDialogProps) => ReactElement = ({
  open,
  products = [],
  type,
  currentDialogData = {},
  setOpen,
  itemKey,
  currencyInfo,
}) => {
  const container = useRef<HTMLInputElement | null>(null)
  const [isOpenCreateShopping, setOpenCreateShopping] = useState(false)

  const [openShoppingList, setOpenShoppingList] = useState(false)
  const [editableProducts, setEditableProducts] = useState<EditableProductItem[]>([])
  const [isRequestLoading, setIsRequestLoading] = useState(false)
  const [checkedArr, setCheckedArr] = useState<number[]>([])

  const [isMobile] = useMobile()

  const handleClose = () => {
    setOpen(false)
  }

  const handleSaveClick = () => {
    if (type === 'shippingList') {
      handleClose()
      setOpenShoppingList(true)
    }
  }

  const handleCreateShoppingClick = () => {
    setOpenCreateShopping(false)
    setOpenShoppingList(true)
  }

  const handleShoppingClose = () => {
    setOpenShoppingList(false)
  }

  const handleShoppingConfirm = async (id: string) => {
    setIsRequestLoading(true)
    try {
      const items = editableProducts.map((product) => {
        const {
          product_id: productId,
          variant_id: variantId,
          editQuantity,
          optionList,
        } = product

        return {
          productId: +productId,
          variantId,
          quantity: +editQuantity,
          optionList: optionList.map((option) => {
            const {
              optionId,
              optionValue,
            } = option

            return {
              optionId: `attribute[${optionId}]`,
              optionValue,
            }
          }),
        }
      })
      const params = items.filter((item) => checkedArr.includes(+item.variantId))

      await addProductToShoppingList({
        shoppingListId: +id,
        items: params,
      })

      snackbar.success('Products were added to your shopping list')

      setOpenShoppingList(false)
    } finally {
      setIsRequestLoading(false)
    }
  }

  const handleOpenCreateDialog = () => {
    setOpenShoppingList(false)
    setOpenCreateShopping(true)
  }

  const handleCloseShoppingClick = () => {
    setOpenCreateShopping(false)
    setOpenShoppingList(true)
  }

  useEffect(() => {
    if (open) {
      setEditableProducts(products.map((item: OrderProductItem) => ({
        ...item,
        editQuantity: item.quantity,
      })))
    }
  }, [open])

  const handleProductChange = (products: EditableProductItem[]) => {
    setEditableProducts(products)
  }

  const IframeDocument = useContext(ThemeFrameContext)
  useEffect(() => {
    if (IframeDocument) {
      IframeDocument.body.style.overflow = open ? 'hidden' : 'initial'
      IframeDocument.body.style.paddingRight = open ? '16px' : '0'
    }
  }, [open, IframeDocument])

  return (
    <>
      <Box
        sx={{
          ml: 3,
          cursor: 'pointer',
          width: '50%',
        }}
      >
        <Box
          ref={container}
        />

        <Dialog
          open={open}
          fullWidth
          container={container.current}
          onClose={handleClose}
          fullScreen={isMobile}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle
            id="alert-dialog-title"
            sx={{
              borderBottom: '1px solid #D9DCE9',
            }}
          >
            {currentDialogData.dialogTitle}
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                margin: '1rem 0',
              }}
            >
              {currentDialogData.description}
            </Typography>
            <OrderCheckboxProduct
              products={editableProducts}
              onProductChange={handleProductChange}
              currencyInfo={currencyInfo}
              setCheckedArr={setCheckedArr}
            />
          </DialogContent>

          <Divider />

          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleSaveClick}
              autoFocus
            >
              {currentDialogData.confirmText}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
      {
        itemKey === 'order-summary' && (
        <OrderShoppingList
          isOpen={openShoppingList}
          dialogTitle="Add to shopping list"
          onClose={handleShoppingClose}
          onConfirm={handleShoppingConfirm}
          onCreate={handleOpenCreateDialog}
          isLoading={isRequestLoading}
          setLoading={setIsRequestLoading}
        />
        )
      }
      {
        itemKey === 'order-summary' && (
        <CreateShoppingList
          open={isOpenCreateShopping}
          onChange={handleCreateShoppingClick}
          onClose={handleCloseShoppingClick}
        />
        )
      }
    </>
  )
}

// LIBS
import { useEffect, useRef, useState } from "react"
import { Alert, View, Keyboard, KeyboardAvoidingView, Platform } from "react-native"
import Bottom, { BottomSheetTextInput } from "@gorhom/bottom-sheet"
import { router } from "expo-router"
import dayjs from "dayjs"

// DATABASE
import { useGoalRepository } from "@/database/useGoalRepository"
import { useTransactionRepository } from "@/database/useTransactionRepository"

// COMPONENTS
import { Input } from "@/components/Input"
import { Header } from "@/components/Header"
import { Button } from "@/components/Button"
import { BottomSheet } from "@/components/BottomSheet"
import { Goals, GoalsProps } from "@/components/Goals"
import { Transactions, TransactionsProps } from "@/components/Transactions"

// UTILS
import { mocks } from "@/utils/mocks"

export default function Home() {
  // LISTS
  const [transactions, setTransactions] = useState<TransactionsProps>([])
  const [goals, setGoals] = useState<GoalsProps>([])

  // FORM
  const [name, setName] = useState("")
  const [total, setTotal] = useState("")

  // DATABASE
  const useGoal = useGoalRepository()
  const useTransaction = useTransactionRepository()

  // BOTTOM SHEET
  const bottomSheetRef = useRef<Bottom>(null)
  const handleBottomSheetOpen = () => bottomSheetRef.current?.expand()
  const handleBottomSheetClose = () => bottomSheetRef.current?.snapToIndex(0)

  function handleDetails(id: string) {
    router.navigate("/details/" + id)
  }

  /**
   * @name handleCreate
   * @returns 
   */
  async function handleCreate() {
    try {
      const totalAsNumber = Number(total.toString().replace(",", "."))

      if (isNaN(totalAsNumber)) {
        return Alert.alert("Erro", "Valor inválido.")
      }

      useGoal.create({ name, total: totalAsNumber })

      Keyboard.dismiss()
      handleBottomSheetClose()
      Alert.alert("Sucesso", "Meta cadastrada!")

      setName("")
      setTotal("")

      fetchGoals()
    } catch (error) {
      Alert.alert("Erro", "Não foi possível cadastrar.")
      console.log(error)
    }
  }

  /**
   * @name fetchGoals
   * @returns get all data goals
   */
  async function fetchGoals() {
    try {
      const response = useGoal.all()
      setGoals(response)
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchTransactions() {
    try {
      const response = useTransaction.findLatest()

      setTransactions(
        response.map((item) => ({
          ...item,
          date: dayjs(item.created_at).format("DD/MM/YYYY [às] HH:mm"),
        }))
      )
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchGoals()
    fetchTransactions()
  }, [])

  return (
    <View className="flex-1 p-8">
      <Header
        title="Suas metas"
        subtitle="Poupe hoje para colher os frutos amanhã."
      />

      <Goals
        goals={goals}
        onAdd={handleBottomSheetOpen}
        onPress={handleDetails}
      />

      <Transactions transactions={transactions} />

      <BottomSheet
        ref={bottomSheetRef}
        title="Nova meta"
        snapPoints={[0.01, 284]}
        onClose={handleBottomSheetClose}
      >
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={20}>
          {/*
          <Input placeholder="Nome da meta" onChangeText={setName} value={name} />
          <Input
            placeholder="Valor"
            keyboardType="numeric"
            onChangeText={setTotal}
            value={total}
          />
          */}

          {
            Platform.OS === 'android' &&
            (
              <>
                <Input placeholder="Nome da meta" onChangeText={setName} value={name} />
                <Input
                  placeholder="Valor"
                  keyboardType="numeric"
                  onChangeText={setTotal}
                  value={total}
                />
              </>
            )
          }

          {
            Platform.OS === 'ios' && (
              <>
                <BottomSheetTextInput
                  placeholder="Nome da meta"
                  onChangeText={setName}
                  value={name}
                  className="self-stretch my-4 mb-6 p-3 align-center rounded-xl bg-gray-400 color-zinc-200"
                />

                <BottomSheetTextInput
                  placeholder="Valor"
                  keyboardType="numeric"
                  onChangeText={setTotal}
                  value={total}
                  className="self-stretch mb-10 p-3 align-center rounded-xl bg-gray-400 color-zinc-200"
                />
              </>
            )
          }

          <Button title="Criar" onPress={handleCreate} />
        </KeyboardAvoidingView>
      </BottomSheet>
    </View>
  )
}
